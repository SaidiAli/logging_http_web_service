type LogMessage = {
  id: number;
  userId: string;
  timestamp: string;
  level: "info" | "warning" | "error";
  text: string;
  hasLocalhostUrl: boolean;
};

export default LogMessage;
