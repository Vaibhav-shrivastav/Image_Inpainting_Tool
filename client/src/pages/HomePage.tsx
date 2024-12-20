import React, { useState } from "react";
import { uploadImage } from "../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaArrowCircleDown } from "react-icons/fa";
import brushInHand from '../media/BrushInHand.webp'


function HomePage() {
  const [isUploading, setIsUploading] = useState(false); 
  const navigate = useNavigate();


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      console.log(file);

      toast.promise(
        (async () => {
          setIsUploading(true); 
          const response = await uploadImage(file);
          console.log("Image uploaded successfully:", response);
          const image_path = `http://localhost:8000/${response.original_image_path}`;
          console.log(image_path);
          navigate("/tool", { state: { imgSrc: image_path } });         
        })(),
        {
          loading: "Uploading image...",
          success: "Image uploaded successfully!",
          error: "Error uploading image. Please try again.",
        }
      ).finally(() => {
        setIsUploading(false); 
      });
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-gray-800 to-gray-300">
        <div className="flex flex-col justify-center items-center gap-4 p-5 ">
          <div className="text-center">
            <h3 className="text-3xl bg-clip-text text-transparent bg-gradient-to-r from-white to-black">Upload an <span className="text-gray-800">image</span> to get started</h3>
          </div>
          <span className="animate-bounce"> <FaArrowCircleDown color="white" size={25} /></span>
          
          <div>
            <input
              type="file"
              accept="image/*"
              className="file-input file-input-bordered w-full max-w-xs "
              onChange={handleFileChange}
            />
          </div>
          <div>
            {isUploading && <span className="loading loading-dots loading-md"></span>}
          </div>
          <div className="">
            <img src={brushInHand} alt="" />
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
