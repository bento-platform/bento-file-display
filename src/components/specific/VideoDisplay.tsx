import { useEffect, useRef } from "react";
import { Spin } from "antd";
import type { BlobDisplayProps } from "@/types/blob";

const VideoDisplay = ({ contents, loading }: BlobDisplayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && contents) {
      videoRef.current.src = URL.createObjectURL(contents);
    }
  }, [videoRef, contents]);

  return (
    <Spin spinning={loading}>
      <video className="bfd--w-full" ref={videoRef} controls={true} />
    </Spin>
  );
};

export default VideoDisplay;
