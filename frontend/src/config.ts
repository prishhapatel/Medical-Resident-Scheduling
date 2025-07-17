export const config = {
  apiUrl:
    process.env.NODE_ENV === "development"
      ? "http://localhost:5109"
      : "https://psycall.net"
};
