import React, { useRef, useState, useEffect } from "react";
import CanvasDraw from "react-canvas-draw";
import { FaUndoAlt } from "react-icons/fa";
import { AiOutlineClear } from "react-icons/ai";
import { VscOpenPreview } from "react-icons/vsc";
import { MdImageNotSupported } from "react-icons/md";
import { FaDownload } from "react-icons/fa";
import { useLocation } from "react-router-dom";

function InPainting(): JSX.Element {
  const location = useLocation();
  const imgSrc: string = location.state?.imgSrc;
  console.log("ImgSrc", imgSrc);
  const canvasRef = useRef<CanvasDraw>(null);
  const [brushSize, setBrushSize] = useState<number>(5);
  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  }>({ width: 800, height: 600 });
  const [modalImages, setModalImages] = useState<{
    original: string;
    mask: string;
  } | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      const maxWidth = window.innerWidth * 0.8;
      const maxHeight = window.innerHeight * 0.8;
      const aspectRatio = img.width / img.height;

      if (img.width > maxWidth || img.height > maxHeight) {
        if (img.width / maxWidth > img.height / maxHeight) {
          setCanvasSize({ width: maxWidth, height: maxWidth / aspectRatio });
        } else {
          setCanvasSize({ width: maxHeight * aspectRatio, height: maxHeight });
        }
      } else {
        setCanvasSize({ width: img.width, height: img.height });
      }
    };
  }, []);

  const handleClear = (): void => {
    canvasRef.current?.clear();
  };

  const handlePreview = (): void => {
    if (canvasRef.current) {
      const maskCanvas = document.createElement("canvas");
      const ctx = maskCanvas.getContext("2d");

      maskCanvas.width = canvasSize.width;
      maskCanvas.height = canvasSize.height;

      if (ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

        const drawing = canvasRef.current.canvas.drawing;
        const dataURL = drawing.toDataURL();

        const imgDrawing = new Image();
        imgDrawing.src = dataURL;
        imgDrawing.onload = () => {
          ctx.drawImage(imgDrawing, 0, 0);
          setModalImages({ original: imgSrc, mask: maskCanvas.toDataURL() });
          const modal = document.getElementById(
            "modal-preview"
          ) as HTMLDialogElement;
          modal?.showModal();
        };
      }
    }
  };

  const handleDownloadMasked = (): void => {
    if (canvasRef.current) {
      const drawing = canvasRef.current.canvas.drawing;
      const link = document.createElement("a");
      link.href = drawing.toDataURL("image/png");
      link.download = "masked_image.png";
      link.click();
    }
  };

  const handleDownloadPair = (): void => {
    if (modalImages) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const imgOriginal = new Image();
      const imgMask = new Image();
      imgOriginal.src = modalImages.original;
      imgMask.src = modalImages.mask;

      imgOriginal.onload = () => {
        imgMask.onload = () => {
          canvas.width = imgOriginal.width + imgMask.width;
          canvas.height = Math.max(imgOriginal.height, imgMask.height);

          if (ctx) {
            ctx.drawImage(imgOriginal, 0, 0);
            ctx.drawImage(imgMask, imgOriginal.width, 0);

            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = "comparison_image.png";
            link.click();
          }
        };
      };
    }
  };

  return (
    <>
      <div className="p-5 m-4 flex flex-col gap-2 bg-gray-200 rounded-md">
        {/* Canvas Draw Space  */}
        <div className="bg-white p-4 rounded-md gap-4">
          <div className="p-2 rounded flex items-center justify-center">
            {imgSrc.startsWith("http") ? (
              <CanvasDraw
                ref={canvasRef}
                brushColor="white"
                brushRadius={brushSize}
                canvasWidth={canvasSize.width}
                canvasHeight={canvasSize.height}
                hideGrid={true}
                imgSrc={imgSrc}
              />
            ) : (
              <MdImageNotSupported />
            )}
          </div>
        </div>
        <div className="bg-white p-3 rounded-md">
          <div className="flex flex-row justify-center px-10 gap-4">
            <button
              className="bg-gray-200 tooltip tooltip-bottom p-2 rounded-md"
              data-tip="Undo"
              onClick={() => canvasRef.current?.undo()}
            >
              <FaUndoAlt size={20} />
            </button>
            <button
              className="bg-gray-200 tooltip tooltip-bottom p-2 rounded-md"
              data-tip="Erase"
              onClick={handleClear}
            >
              <AiOutlineClear size={25} />
            </button>
            <div
              className="flex items-center tooltip tooltip-bottom"
              data-tip="Brush Size"
            >
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                className="range range-sm"
              />
            </div>
            <button
              className="bg-cyan-200 tooltip tooltip-bottom p-2 rounded-md"
              data-tip="Preview"
              onClick={handlePreview}
            >
              <VscOpenPreview size={25} />
            </button>

            <button
              className="bg-green-200 tooltip tooltip-bottom p-2 rounded-md"
              data-tip="Download Masked Image"
              onClick={handleDownloadMasked}
            >
              <FaDownload size={20} />
            </button>
          </div>
        </div>
      </div>
      <dialog id="modal-preview" className="modal">
        <div className="modal-box  w-11/12 max-w-5xl rounded-md">
          <h3 className="font-bold text-lg">Mask Preview</h3>
          <div className="flex justify-around py-4">
            {modalImages && (
              <>
                <div className="flex flex-col items-center">
                  <h4 className="font-semibold">Original Image</h4>
                  <img
                    src={modalImages.original}
                    alt="Original"
                    className="border max-w-full max-h-96"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <h4 className="font-semibold">Masked Image</h4>
                  <img
                    src={modalImages.mask}
                    alt="Masked"
                    className="border max-w-full max-h-96"
                  />
                </div>
              </>
            )}
          </div>
          <div className="modal-action flex justify-between">
            <button
              className="btn"
              onClick={() => {
                const modal = document.getElementById(
                  "modal-preview"
                ) as HTMLDialogElement;
                modal?.close();
              }}
            >
              Close
            </button>
            <button className="btn btn-primary" onClick={handleDownloadPair}>
              Download Combined
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

export default InPainting;
