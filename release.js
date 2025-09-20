import { execSync } from "child_process";
import pkg from "./package.json" with { type: "json" };

const version = pkg.version;

execSync(`git tag v${version}`, { stdio: "inherit" });
execSync(`git push origin v${version}`, { stdio: "inherit" });
