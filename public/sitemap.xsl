<?xml version="1.0" encoding="UTF-8"?>
<!-- Hiển thị sitemap dạng bảng (phong cách Yoast SEO) khi mở bằng trình duyệt. -->
<xsl:stylesheet version="2.0"
  xmlns:html="http://www.w3.org/TR/REC-html40"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap – YokaiDex</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style type="text/css">
          body { margin: 0; font: 14px/1.5 -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #444; background: #fff; }
          #header { background: #e85a3d; color: #fff; padding: 22px 30px 18px; }
          #header h1 { margin: 0 0 6px; font-size: 26px; font-weight: 700; }
          #header p { margin: 0; color: rgba(255,255,255,.9); }
          #header a { color: #fff; font-weight: 600; }
          #content { margin: 0 auto; padding: 20px 30px 40px; max-width: 1200px; }
          .desc { margin: 0 0 16px; color: #666; }
          .desc b { color: #333; }
          table { border: none; border-collapse: collapse; width: 100%; }
          th { text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 2px solid #e85a3d; background: #fff8f6; color: #333; white-space: nowrap; }
          td { padding: 8px 12px; font-size: 13px; border-bottom: 1px solid #f0f0f0; word-break: break-all; }
          tr:nth-child(odd) td { background: #fafafa; }
          tr:hover td { background: #fff1ec; }
          a { color: #2253c4; text-decoration: none; }
          a:hover { text-decoration: underline; }
          td.num, th.num { text-align: right; width: 70px; white-space: nowrap; }
          td.date, th.date { width: 200px; white-space: nowrap; word-break: normal; }
          .back { display: inline-block; margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <div id="header">
          <h1>XML Sitemap</h1>
          <p>
            Sitemap của <a href="/">YokaiDex</a>, dành cho công cụ tìm kiếm như Google và Bing.
            Tìm hiểu thêm tại <a href="https://www.sitemaps.org/" target="_blank" rel="noopener">sitemaps.org</a>.
          </p>
        </div>
        <div id="content">
          <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &gt; 0">
            <p class="desc">Sitemap index này gồm <b><xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/></b> sitemap.</p>
            <table>
              <thead>
                <tr>
                  <th>Sitemap</th>
                  <th class="date">Cập nhật lần cuối</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                  <xsl:variable name="loc"><xsl:value-of select="sitemap:loc"/></xsl:variable>
                  <tr>
                    <td><a href="{$loc}"><xsl:value-of select="sitemap:loc"/></a></td>
                    <td class="date"><xsl:value-of select="concat(substring(sitemap:lastmod,0,11),' ',substring(sitemap:lastmod,12,5))"/></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:if>
          <xsl:if test="count(sitemap:urlset/sitemap:url) &gt; 0">
            <a class="back" href="/sitemap_index.xml">← Tất cả sitemap</a>
            <p class="desc">Sitemap này gồm <b><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></b> URL.</p>
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th class="num">Ảnh</th>
                  <th class="date">Cập nhật lần cuối</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <xsl:variable name="loc"><xsl:value-of select="sitemap:loc"/></xsl:variable>
                  <tr>
                    <td><a href="{$loc}"><xsl:value-of select="sitemap:loc"/></a></td>
                    <td class="num"><xsl:value-of select="count(image:image)"/></td>
                    <td class="date"><xsl:value-of select="concat(substring(sitemap:lastmod,0,11),' ',substring(sitemap:lastmod,12,5))"/></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:if>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
