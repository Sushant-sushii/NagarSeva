const {ImageKit}= require('@imagekit/nodejs');

const ImageKitclient = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "public_test",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "private_test",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/test"
});

async function uploadImage(file) {
    try {
        const result=await ImageKitclient.files.upload({
            file,
            fileName:"complaint_"+Date.now().toString()+".jpg",
            folder:"NagarSeva/Complaint_images"
        });
        console.log("ImageKit upload result:", result);
        return result.url;
    } catch (error) {
        console.error("ImageKit upload error: ", error.message || error);
        // Graceful fallback to avoid breaking the frontend demo if keys are invalid
        const fallbackUrl = "https://images.unsplash.com/photo-1594913785162-e6785b49eed9?auto=format&fit=crop&w=600&q=80";
        console.log("Falling back to placeholder URL: ", fallbackUrl);
        return fallbackUrl;
    }
}

module.exports={uploadImage}