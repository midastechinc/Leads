// deno test outreach_test.ts
import { classifyReply, ownText } from "./outreach.ts";
const eq = (a: unknown, b: unknown) => { if (a !== b) throw new Error(`${a} !== ${b}`); };
Deno.test("plain reply quoting our footer is not an unsubscribe", () => {
  eq(classifyReply("RE: KPK Law email security", "Sure, let's talk Thursday. From: Ali Jaffar <ali@x> Sent: Monday ... Don't want these emails? Unsubscribe or reply \"unsubscribe\"."), "reply");
});
Deno.test("real unsubscribe reply", () => { eq(classifyReply("RE: hi", "Please remove me from your list. From: Ali"), "unsubscribe"); });
Deno.test("unsubscribe in subject", () => { eq(classifyReply("Unsubscribe", ""), "unsubscribe"); });
Deno.test("not interested", () => { eq(classifyReply("RE: x", "No thanks, we already have an MSP. On Mon, Oct 12, 2026 Ali wrote:"), "not_interested"); });
Deno.test("auto reply", () => { eq(classifyReply("Automatic reply: x", "I'm away"), "auto_reply"); });
Deno.test("ownText cuts quote", () => { eq(ownText("Yes please From: Ali"), "Yes please"); });
