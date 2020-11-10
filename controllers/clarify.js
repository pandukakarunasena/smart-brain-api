const {ClarifaiStub} = require("clarifai-nodejs-grpc");
const grpc = require("@grpc/grpc-js");

// Construct one of the stubs you want to use
const stub = ClarifaiStub.json();
//const stub = ClarifaiStub.insecureGrpc();

const faceDetection = (req,res) => {
    if(req.body.imageUrl){
        const IMAGE_URL = req.body.imageUrl
        console.log(IMAGE_URL)
        const stub = ClarifaiStub.grpc();
        const API_KEY = "4d1bcd759c864cb1a19418b91d0e331f"
        const MODEL_ID = "d02b4508df58432fbb84e800597b8959"
        
        const metadata = new grpc.Metadata();
        metadata.set("authorization", `Key ${API_KEY}`);
        
        
        stub.PostModelOutputs(
            {
                model_id: MODEL_ID ,
                inputs: [{data: {image: {url: `${IMAGE_URL}`}}}]
            },
            
            metadata,
            (err, response) => {
                if (err) {
                    console.log("Error: " + err);
                    return;
                }
        
                if (response.status.code !== 10000) {
                    console.log("Received failed status: " + response.status.description + "\n" + response.status.details);
                    return;
                }
                
                

                for (const c of response.outputs[0].data.concepts) {
                    console.log(c.name + ": " + c.value);
                }

                const output = response.outputs[0];
                console.log('data sent')
                res.json(output)
                
            }
        )
        }else{
            console.log('image not found')
            res.json('image not found')
        }
}


module.exports = {
    faceDetection: faceDetection
}