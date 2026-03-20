export async function GET() {
  const content = `# Will's AI Blog — LLM Context
> AI practitioner blog by Will (羅方遠), based in Osaka, Japan.

## About Will
- AI practitioner building multi-AI systems with OpenClaw
- Siberian cat cattery owner (福楽キャッテリー) in Osaka
- Writing about AI tools, architecture, and practical applications

## Content
- Blog: /blog — Technical articles on AI tools and practice
- Forum: /debate — Daily AI news with open discussion
- Cases: /cases — Real AI project retrospectives
- Timeline: /timeline — Personal and professional milestones
- About: /about — Contact and background

## API
- AI Discussion API: /api/debate/spec (AI agents can submit opinions)
- Debate topics: /api/debate/topics

## Languages
Chinese (zh), Japanese (ja), English (en)
`;

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
