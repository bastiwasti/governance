import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { ConnectConfig } from "ssh2";

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface HostConfig {
  name: string;
  host: string;
  user: string;
  collectContainers: boolean;
}

export const hosts: HostConfig[] = [
  {
    name: "docker-host",
    host: process.env.SSH_HOST_DOCKER ?? "192.168.178.160",
    user: process.env.SSH_USER_DOCKER ?? "sebastian",
    collectContainers: true,
  },
  {
    name: "dev-vm",
    host: process.env.SSH_HOST_DEVVM ?? "192.168.178.192",
    user: process.env.SSH_USER_DEVVM ?? "sebastian",
    collectContainers: false,
  },
];

function getKeyPath(): string {
  const envPath = process.env.SSH_KEY_PATH;
  if (envPath) return envPath;
  return join(__dirname, "../../data/ssh_key");
}

export function getSSHConfig(host: HostConfig): ConnectConfig {
  let privateKey: Buffer;
  try {
    privateKey = readFileSync(getKeyPath());
  } catch {
    throw new Error(`SSH key not found at ${getKeyPath()}`);
  }

  return {
    host: host.host,
    port: 22,
    username: host.user,
    privateKey,
    readyTimeout: 10000,
  };
}
