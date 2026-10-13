// Firestore rules tests. Run:  cd tests/firestore-rules && npm install && npm test
// (needs Java 11+; starts the Firestore emulator via firebase-tools).
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { readFileSync } from "node:fs";
import { doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, collection, query, where, orderBy, writeBatch } from "firebase/firestore";

const env = await initializeTestEnvironment({
  projectId: "demo-leads-rules",
  firestore: { rules: readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 },
});
const ADMIN = { uid: "u_admin", email: "ali@midastech.ca", name: "Ali" };
const REP   = { uid: "u_rep",   email: "ambreen@midastech.ca", name: "Ambreen" };
const REP2  = { uid: "u_rep2",  email: "scout@midastech.ca", name: "Scout" };
const OUT   = { uid: "u_out",   email: "stranger@example.com", name: "Stranger" };
await env.withSecurityRulesDisabled(async ctx => {
  const db = ctx.firestore();
  await setDoc(doc(db, "users", ADMIN.uid), { name: ADMIN.name, email: ADMIN.email, role: "admin" });
  await setDoc(doc(db, "users", REP.uid),   { name: REP.name,   email: REP.email,   role: "rep" });
  await setDoc(doc(db, "users", REP2.uid),  { name: REP2.name,  email: REP2.email,  role: "rep" });
  await setDoc(doc(db, "leads", "mine"),       { name: "A", assignedTo: "Ambreen", createdAt: 1 });
  await setDoc(doc(db, "leads", "unassigned"), { name: "B", assignedTo: "", createdAt: 2 });
  await setDoc(doc(db, "leads", "theirs"),     { name: "C", assignedTo: "Scout", createdAt: 3 });
  await setDoc(doc(db, "activities", "a_mine"),   { leadId: "mine", notes: "x" });
  await setDoc(doc(db, "activities", "a_theirs"), { leadId: "theirs", notes: "y" });
  await setDoc(doc(db, "importBatches", "b1"), { fileName: "f.csv" });
  await setDoc(doc(db, "archiveOperations", "op1"), { performedAt: 1 });
  await setDoc(doc(db, "archivedLeads", "x1"), { archiveOperationId: "op1" });
  await setDoc(doc(db, "doNotContact", "bad@example.com"), { email: "bad@example.com" });
});
const as = u => env.authenticatedContext(u.uid, { email: u.email }).firestore();
const admin = as(ADMIN), rep = as(REP), out = as(OUT);
let pass = 0, fail = 0;
async function t(name, p) { try { await p; pass++; console.log("ok  ", name); } catch (e) { fail++; console.log("FAIL", name, e.message); } }

// leads — admin
await t("admin reads all leads (ordered query)", assertSucceeds(getDocs(query(collection(admin, "leads"), orderBy("createdAt", "desc")))));
await t("admin deletes lead", assertSucceeds(deleteDoc(doc(admin, "leads", "theirs"))));
await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), "leads", "theirs"), { name: "C", assignedTo: "Scout", createdAt: 3 }));
// leads — rep
await t("rep unfiltered leads query denied", assertFails(getDocs(collection(rep, "leads"))));
const repQ = await getDocs(query(collection(rep, "leads"), where("assignedTo", "in", ["", "Ambreen"]))).catch(e => e);
await t("rep filtered query (page query) succeeds with 2 docs", Promise.resolve().then(() => { if (repQ instanceof Error) throw repQ; if (repQ.size !== 2) throw new Error("size " + repQ.size); }));
await t("rep reads own lead", assertSucceeds(getDoc(doc(rep, "leads", "mine"))));
await t("rep reads unassigned lead", assertSucceeds(getDoc(doc(rep, "leads", "unassigned"))));
await t("rep cannot read other rep's lead", assertFails(getDoc(doc(rep, "leads", "theirs"))));
await t("rep updates own lead", assertSucceeds(updateDoc(doc(rep, "leads", "mine"), { status: "Contacted" })));
await t("rep claims unassigned lead", assertSucceeds(updateDoc(doc(rep, "leads", "unassigned"), { assignedTo: "Ambreen" })));
await t("rep cannot update other rep's lead", assertFails(updateDoc(doc(rep, "leads", "theirs"), { assignedTo: "Ambreen" })));
await t("rep hands own lead to another rep", assertSucceeds(updateDoc(doc(rep, "leads", "mine"), { assignedTo: "Scout" })));
await t("rep creates a lead", assertSucceeds(addDoc(collection(rep, "leads"), { name: "New", assignedTo: "" })));
await t("rep cannot delete lead", assertFails(deleteDoc(doc(rep, "leads", "unassigned"))));
await t("outsider cannot read", assertFails(getDoc(doc(out, "leads", "unassigned"))));
// activities
await t("rep reads activities of accessible lead (page query)", assertSucceeds(getDocs(query(collection(rep, "activities"), where("leadId", "==", "unassigned")))));
await t("rep cannot read activities of other rep's lead", assertFails(getDocs(query(collection(rep, "activities"), where("leadId", "==", "theirs")))));
await t("rep adds activity on accessible lead", assertSucceeds(addDoc(collection(rep, "activities"), { leadId: "unassigned", notes: "call" })));
await t("rep cannot add activity on other rep's lead", assertFails(addDoc(collection(rep, "activities"), { leadId: "theirs", notes: "call" })));
await t("rep unfiltered activities query denied", assertFails(getDocs(collection(rep, "activities"))));
await t("rep cannot delete activity", assertFails(deleteDoc(doc(rep, "activities", "a_mine"))));
await t("admin reads all activities", assertSucceeds(getDocs(collection(admin, "activities"))));
// admin-only collections
for (const c of ["importBatches", "archiveOperations", "archivedLeads", "archivedImportBatches"]) {
  await t(`rep cannot read ${c}`, assertFails(getDocs(collection(rep, c))));
  await t(`rep cannot write ${c}`, assertFails(setDoc(doc(rep, c, "z"), { a: 1 })));
  await t(`admin reads ${c}`, assertSucceeds(getDocs(collection(admin, c))));
  await t(`admin writes ${c}`, assertSucceeds(setDoc(doc(admin, c, "z"), { a: 1 })));
}
// archive flow as admin in one batch
await t("admin archive batch (archivedLeads set + leads delete)", assertSucceeds((() => { const b = writeBatch(admin); b.set(doc(admin, "archivedLeads", "unassigned"), { archiveOperationId: "op1" }); b.delete(doc(admin, "leads", "unassigned")); return b.commit(); })()));
// users
await t("rep cannot rename self", assertFails(updateDoc(doc(rep, "users", REP.uid), { name: "Scout" })));
await t("rep cannot promote self", assertFails(updateDoc(doc(rep, "users", REP.uid), { role: "admin" })));
await t("rep can update other own fields", assertSucceeds(updateDoc(doc(rep, "users", REP.uid), { lastSeen: 1 })));
// doNotContact
await t("rep reads DNC list", assertSucceeds(getDocs(collection(rep, "doNotContact"))));
await t("rep adds DNC entry", assertSucceeds(setDoc(doc(rep, "doNotContact", "x@y.com"), { email: "x@y.com", reason: "Unsubscribed" }, { merge: true })));
await t("DNC id must be lowercase", assertFails(setDoc(doc(rep, "doNotContact", "X@y.com"), { email: "X@y.com" })));
await t("DNC email must match id", assertFails(setDoc(doc(rep, "doNotContact", "q@y.com"), { email: "other@y.com" })));
await t("rep cannot delete DNC entry", assertFails(deleteDoc(doc(rep, "doNotContact", "bad@example.com"))));
await t("admin deletes DNC entry", assertSucceeds(deleteDoc(doc(admin, "doNotContact", "bad@example.com"))));
await t("outsider cannot read DNC", assertFails(getDocs(collection(out, "doNotContact"))));

await env.cleanup();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
