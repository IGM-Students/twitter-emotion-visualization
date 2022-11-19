import toast from "react-hot-toast";

const ENDPOINT = "http://localhost:5000";

export async function getFetch<T>(
    url: string,
    options?: { customError?: boolean }
): Promise<T & { message: string }> {
    return new Promise((resolve, reject) => {
        const toastId = toast.loading("Ładowanie...");
        fetch(ENDPOINT + url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
            .then(async (response) => {
                const data = (await response.json()) as T & { message: string };
                if (response.ok) {
                    toast.success(data.message, { id: toastId });
                    resolve(data);
                } else {
                    toast.error(data.message, { id: toastId });

                    if (options?.customError) reject(data);
                }
            })
            .catch((error) => {
                toast.error("Serwer nie odpowiada :(", { id: toastId });
                if (options?.customError) reject(error);
            });
    });
}
