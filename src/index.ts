import { server } from "@/server";

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const gracefulShutdown = () => {
    console.log("Shutting down server...");
    server.close(() => {
        console.log("Server closed");
        process.exit(0);
    });
    setTimeout(() => {
        console.error("Could not close server in time, forcefully shutting down");
        process.exit(1);
    }, 5000).unref();
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);