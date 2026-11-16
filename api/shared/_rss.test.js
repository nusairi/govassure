// Unit tests for the RSS/Atom decoder. Run: node api/shared/_rss.test.js
const { decode, parseFeed } = require("./_rss.js");

let failed = 0;
function ok(name, cond) {
  if (!cond) {
    failed++;
    console.error("FAIL", name);
  } else {
    console.log("PASS", name);
  }
}

ok("ampersand", decode("AT&amp;T") === "AT&T");
ok("quotes and apostrophes", decode("&quot;hi&quot; &#39;x&apos;") === '"hi" \'x\'');
ok("CDATA", decode("<![CDATA[Hello & world]]>") === "Hello & world");
ok("real tags stripped", decode("A <b>bold</b> title") === "A bold title");
ok("entity-hidden tags stripped", decode("&lt;script&gt;alert(1)&lt;/script&gt;") === "alert(1)");
ok("no raw angle brackets from hidden tags", !decode("&lt;script&gt;x&lt;/script&gt;").includes("<"));
ok("double-encoded entities are not turned into tags", decode("&amp;lt;script&amp;gt;x&amp;lt;/script&amp;gt;") === "&lt;script&gt;x&lt;/script&gt;");
ok("encoded HTML becomes plain text", decode("A &lt;b&gt;bold&lt;/b&gt; title") === "A bold title");
ok("whitespace collapsed", decode("  foo   bar  ") === "foo bar");
ok("empty", decode("") === "" && decode(null) === "");

const xml = `<?xml version="1.0"?><rss><channel>
<item><title>AT&amp;T warning</title><link>https://example.com/b</link><description>Normal &amp; fine</description><pubDate>Thu, 12 Nov 2026 06:00:00 GMT</pubDate></item>
<item><title>&lt;script&gt;alert(1)&lt;/script&gt;</title><link>https://example.com/a</link><description>A &lt;b&gt;bold&lt;/b&gt; title</description></item>
</channel></rss>`;
const items = parseFeed(xml);
ok("parse normal title and link", items[0].title === "AT&T warning" && items[0].link === "https://example.com/b" && items[0].summary === "Normal & fine");
ok("parse hidden-tag title and summary", items[1].title === "alert(1)" && items[1].summary === "A bold title");

if (failed) {
  console.error(failed + " failed");
  process.exit(1);
}
console.log("ALL-TESTS-PASSED");
