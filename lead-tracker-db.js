// Lead Tracker data access through the Railway service (no Supabase key in the browser).
//
// A tiny stand-in for the parts of supabase-js the app used:
//   db.from("social_posts").select("*").eq("id", 1).order("created_at", { ascending: false }).limit(50)
//   db.from("social_posts").insert(rows).select("*") / .update(fields).eq(...) / .delete().eq(...)
// Each query is sent to POST <server>/db with the signed-in user's Firebase ID token; the
// server checks the token and runs it with the service-role key (supabase/functions/extract-contacts/db.ts).
// Like supabase-js, awaiting a query gives { data, error } and never throws.
(function () {
  function createLeadTrackerDb(serverUrl, getToken) {
    const base = String(serverUrl || "").replace(/\/+$/, "");

    async function call(path, body) {
      let token = "";
      try { token = (await getToken()) || ""; } catch (e) {}
      if (!token) return { data: null, error: { message: "Sign in to the lead tracker again, then retry." } };
      let res;
      try {
        res = await fetch(`${base}${path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-firebase-token": token },
          body: JSON.stringify(body)
        });
      } catch (e) {
        return { data: null, error: { message: "Couldn't reach the lead tracker server. Check your connection and try again." } };
      }
      const out = await res.json().catch(() => ({}));
      if (!res.ok) return { data: null, error: { message: out.error || `Server error (HTTP ${res.status}).`, status: res.status } };
      return { data: out.data === undefined ? out : out.data, error: null };
    }

    class Query {
      constructor(table) {
        this.q = { table, action: "select", columns: "*", filters: [], order: [] };
      }
      select(columns) {
        if (this.q.action === "select") this.q.columns = columns || "*";
        else { this.q.returning = true; this.q.columns = columns || "*"; }
        return this;
      }
      insert(values) { this.q.action = "insert"; this.q.values = values; return this; }
      update(values) { this.q.action = "update"; this.q.values = values; return this; }
      delete() { this.q.action = "delete"; return this; }
      _f(col, op, value) { this.q.filters.push({ col, op, value }); return this; }
      eq(col, value) { return this._f(col, "eq", value); }
      neq(col, value) { return this._f(col, "neq", value); }
      gt(col, value) { return this._f(col, "gt", value); }
      gte(col, value) { return this._f(col, "gte", value); }
      lt(col, value) { return this._f(col, "lt", value); }
      lte(col, value) { return this._f(col, "lte", value); }
      is(col, value) { return this._f(col, "is", value); }
      order(col, opts) {
        const o = opts || {};
        this.q.order.push({ col, ascending: o.ascending !== false, ...(typeof o.nullsFirst === "boolean" ? { nullsFirst: o.nullsFirst } : {}) });
        return this;
      }
      limit(n) { this.q.limit = n; return this; }
      then(resolve, reject) { return call("/db", this.q).then(resolve, reject); }
    }

    return {
      from(table) { return new Query(table); },
      // Saves a post image (data URL) to the public social-post-images bucket. Resolves to { publicUrl, error }.
      async uploadSocialPostImage(path, dataUrl, contentType) {
        const { data, error } = await call("/storage/social-post-image", { path, image: dataUrl, contentType: contentType || "image/jpeg" });
        return { publicUrl: data && data.publicUrl ? data.publicUrl : "", error };
      }
    };
  }
  window.createLeadTrackerDb = createLeadTrackerDb;
})();
