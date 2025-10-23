import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSignedUrl as getCloudFrontSignedUrl } from "@aws-sdk/cloudfront-signer";

const s3Client = new S3Client({
  profile : "nodejs",
  region: "us-east-1",
});

export const creteUploadSignedUrl = async ({ Key, ContentType }) => { 
  const command = new PutObjectCommand({
    Bucket: "private-storageapp",
    Key,
    ContentType,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  return signedUrl;
};

export const clound_Front_Get_Url = async ({key , download = false , fileName })=> {
  const command = new GetObjectCommand({
    Bucket : "private-storageapp",
    Key : key,
    ResponseContentDisposition : `${download ? "attachment" : "inline"}; filename="${fileName}"`
  });

 const url =  await  getSignedUrl(s3Client, command, { expiresIn: 300 });
  console.log(url);
  return url ; 
} 



export const get_S3_File_Meta_Data  = async ({Key})=> {
  const command = new HeadObjectCommand({
    Bucket : "private-storageapp",
    Key
  });
  return await s3Client.send(command).then((data) => {
    return data; 
  })
  
}

export const deleteS3File = async ({Key})=> {
  const command = new DeleteObjectCommand({
  Bucket : "private-storageapp",
  Key
  });

 try {
   const response = await s3Client.send(command);
  return response;
 } catch (error) {
   console.log(error.message);
   return error.message
 }
}