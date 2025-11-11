import { useEffect, useMemo, useRef } from "react";
import { Spin } from "antd";
import type { BlobDisplayProps } from "@/types/blob";

interface ImageBlobDisplayProps extends BlobDisplayProps {
  alt: string;
}

const ImageBlobDisplay = ({ alt, contents, loading }: ImageBlobDisplayProps) => {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current && contents) {
      imgRef.current.src = URL.createObjectURL(contents);
    }
  }, [imgRef, contents]);

  const imgOpacity = useMemo(() => ({ opacity: loading ? 0 : 1 }), [loading]);

  return (
    <div className="bento-image-blob-display bfd--w-full">
      {loading && (
        <Spin spinning={true}>
          <div className="bfd--w-full" style={{ height: 200 }} />
        </Spin>
      )}
      <img alt={alt} ref={imgRef} className="bento-image-blob-display__img" style={imgOpacity} />
    </div>
  );
};

export default ImageBlobDisplay;
