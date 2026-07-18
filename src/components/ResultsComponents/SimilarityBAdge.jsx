// Badge for similarity
const SimilarityBadge = ({ level }) => {
  const baseStyle = "px-2.5 py-1 text-xs font-semibold rounded-full";
  switch (level) {
    case "High":
      return <span className={`${baseStyle} bg-green-100 text-green-800`}>High</span>;
    case "Medium":
      return <span className={`${baseStyle} bg-yellow-100 text-yellow-800`}>Medium</span>;
    case "Low":
      return <span className={`${baseStyle} bg-red-100 text-red-800`}>Low</span>;
    default:
      return <span className={`${baseStyle} bg-gray-100 text-gray-800`}>{level || "Requires AI"}</span>;
  }
};

export default SimilarityBadge;