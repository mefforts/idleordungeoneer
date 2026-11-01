const {createHash}=require('node:crypto');
const testingCodes={speed:'qa-speed',sandbox:'qa-sandbox'};
// Exercise real redemption with non-production phrases in HTTP responses only.
function withTestingCodes(html){
 const actions=Object.fromEntries(Object.entries(testingCodes).map(([action,phrase])=>[createHash('sha256').update(phrase).digest('hex'),action]));
 const pattern=/const REDEEM_CODE_ACTIONS=Object\.freeze\(\{[^}]*\}\);/;
 if(!pattern.test(html))throw Error('Redemption fixture seam missing');
 return html.replace(pattern,'const REDEEM_CODE_ACTIONS=Object.freeze('+JSON.stringify(actions)+');');
}
module.exports={testingCodes,withTestingCodes};
