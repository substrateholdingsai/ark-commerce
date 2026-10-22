with open('astro.config.mjs', 'r', encoding='utf-8') as f:
    c = f.read()

old = '''  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      configPath: "./wrangler.toml",
    },
  }),'''

new = '  adapter: cloudflare(),'

if old in c:
    c = c.replace(old, new)
    with open('astro.config.mjs', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Replaced platformProxy!")
else:
    # try CRLF
    old_crlf = old.replace('\n', '\r\n')
    if old_crlf in c:
        c = c.replace(old_crlf, new)
        with open('astro.config.mjs', 'w', encoding='utf-8') as f:
            f.write(c)
        print("Replaced platformProxy with CRLF!")
    else:
        print("Not found")
