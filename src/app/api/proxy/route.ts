import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('target');

  if (!target) {
    return NextResponse.json({ error: 'Missing target parameter' }, { status: 400 });
  }

  const decodedUrl = decodeURIComponent(target);

  try {
    const upstreamResponse = await fetch(decodedUrl, {
      headers: {
        Referer: 'https://megacloud.blog/', // Adjust as needed.
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
        Accept: 'application/vnd.apple.mpegurl, application/x-mpegurl, */*',
      },
    });

    if (!upstreamResponse.ok) {
      return new NextResponse(null, { status: upstreamResponse.status });
    }

    const contentType = upstreamResponse.headers.get('content-type') || '';
    const corsHeaders = { 'Access-Control-Allow-Origin': '*' };

    // Only treat it as a manifest for URL rewriting if it ends with .m3u8
    // or the upstream says it's MPEG URL‐based.
    const isManifest = decodedUrl.endsWith('.m3u8') || contentType.includes('mpegurl');

    if (isManifest) {
      const textData = await upstreamResponse.text();

      // Derive the upstream base URL for resolving relative URLs.
      const targetUrlObject = new URL(decodedUrl);
      const basePath = targetUrlObject.pathname.substring(
        0,
        targetUrlObject.pathname.lastIndexOf('/') + 1
      );
      const upstreamBaseUrl = `${targetUrlObject.origin}${basePath}`;

      // Build proxy URL prefix; here we force every outgoing URL to go through our proxy.
      // (For development it’s hardcoded to localhost; in production you might use request.nextUrl.origin.)
      const hostProxyUrl = `http://localhost:3000/api/proxy?target=`;

      // Rewrite every line in the manifest.
      // For comment lines (which may include inline URI attributes) and standalone URLs,
      // always force the URL to be prefixed with our proxy.
      const rewrittenLines = textData.split(/\r?\n/).map((line) => {
        if (line.startsWith('#')) {
          if (line.includes('URI="')) {
            return line.replace(/URI="([^"]+)"/g, (_match, segUrl) => {
              let absoluteUrl: string;
              const isAbsolute = segUrl.startsWith('http://') || segUrl.startsWith('https://');
              if (isAbsolute) {
                absoluteUrl = segUrl;
              } else {
                absoluteUrl = upstreamBaseUrl + segUrl;
              }
              return `URI="${hostProxyUrl}${encodeURIComponent(absoluteUrl)}"`;
            });
          }
          return line;
        }

        if (line.trim() !== '') {
          let absoluteUrl: string;
          const isAbsolute = line.startsWith('http://') || line.startsWith('https://');
          if (isAbsolute) {
            absoluteUrl = line;
          } else {
            absoluteUrl = upstreamBaseUrl + line;
          }
          return `${hostProxyUrl}${encodeURIComponent(absoluteUrl)}`;
        }
        return line;
      });

      const newText = rewrittenLines.join('\n');
      return new NextResponse(newText, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          ...corsHeaders,
        },
      });
    } else {
      // For non-manifest (binary) responses, simply pipe the upstream body.
      return new NextResponse(upstreamResponse.body, {
        status: 200,
        headers: {
          'Content-Type': upstreamResponse.headers.get('content-type') || 'application/octet-stream',
          ...corsHeaders,
        },
      });
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
