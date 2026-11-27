// 注意: Claude Code のクラウド環境ではタグのpushが403で拒否される。
// その場合は release.yml を workflow_dispatch（publish: true）で実行する（docs/release.md 参照）
import { execSync } from "child_process";
import pkg from "./package.json" with { type: "json" };

const version = pkg.version;

execSync(`git tag v${version}`, { stdio: "inherit" });
execSync(`git push origin v${version}`, { stdio: "inherit" });
