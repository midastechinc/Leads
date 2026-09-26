# Runs the screenshot reader as its own service (e.g. on Railway).
# Not needed when the function is deployed to Supabase.
FROM denoland/deno:2.9.7
WORKDIR /app
RUN chown deno:deno /app
USER deno
COPY --chown=deno:deno index.ts .
RUN deno cache index.ts
CMD ["run", "--allow-net", "--allow-env", "--allow-read", "index.ts"]
