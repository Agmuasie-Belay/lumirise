const PPTBlock = ({ data }) => {
  const embedUrl = data.path?.includes("/embed")
    ? data.path
    : `${data.path}/embed`;
  return (
    <iframe
      src={embedUrl}
      width="100%"
      height="420px"
      title="PPT Viewer"
      frameBorder="0"
      allowFullScreen
      mozAllowFullScreen="true"
      webkitAllowFullScreen="true"
      style={{
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "12px",
        borderBottomLeftRadius: "0px",
        borderBottomRightRadius: "0px",
      }}
    />
  );
};

export default PPTBlock;
