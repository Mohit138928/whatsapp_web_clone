const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

class ApiClient {
  async fetchChats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chats`);
      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching chats:", error);
      return [];
    }
  }

  async sendMessage(messageData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }
}

const apiClient = new ApiClient();
export default apiClient;
