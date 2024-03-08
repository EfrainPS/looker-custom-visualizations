const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    sunburst_chart: "./src/sunburst.js"
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        use: "babel-loader",
        exclude: /node_modules/,
        include: /src/,
        sideEffects: false,
      },
      { test: /\.css$/i, use: ["to-string-loader", "css-loader"] },
    ],
  },
  resolve: {
    extensions: [".jsx", ".js"],
    fallback: { buffer: false },
  }
};
