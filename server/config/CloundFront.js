import { getSignedUrl } from "@aws-sdk/cloudfront-signer";


const privateKey = process.env.AWS_CLOUDFRONT_PRIVATE_KEY;
const keyPairId = "K176HUBFCYBM2V";
 const dateLessThan = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour expiry

export const cloud_Front_Get_Url = ({key , download = false , fileName }) =>{
const url = `https://d6bp7k8ckoxwn.cloudfront.net/${key}?response-content-disposition=${encodeURIComponent(`${download ? "attachment" : "inline"}; filename=${fileName}`)}`;

 const signedUrl = getSignedUrl({
  url ,
  keyPairId,
  dateLessThan,
  privateKey,
});

return signedUrl

}
