// Counterfeit "X26 Ultra" tablet teardown. Body is authored as trimmed, redacted
// HTML in ./temu.html (the step-by-step unlock/root/cert mechanics and sensitive
// identifiers are deliberately left out of the public post) and rendered via ?raw,
// same pattern as PovArticle.
import bodyHtml from './temu.html?raw'

export function TemuArticle() {
  return (
    <div className="text-17px leading-[1.75] text-body2">
      <div className="md-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </div>
  )
}
