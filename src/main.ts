import * as core from "@actions/core";
import { ToolsDirectory } from "./toolsDirectory";
import * as dotnet from "./dotnet";
import * as cake from "./cake";
import { CakeArgument } from "./cakeParameter";

export async function run() {
  try {
    const scriptPath = core.getInput("script-path");
    const version = core.getInput("cake-version");
    const bootstrap =
      (core.getInput("cake-bootstrap") || "").toLowerCase() === "true";
    const target = new CakeArgument("target", core.getInput("target"));
    const verbosity = new CakeArgument("verbosity", core.getInput("verbosity"));
    const scriptArgs = new CakeArgument("assemblyVersion", "1.2.3");

    const toolsDir = new ToolsDirectory();
    toolsDir.create();

    dotnet.disableTelemetry();
    dotnet.disableWelcomeMessage();

    await dotnet.installLocalCakeTool(toolsDir, version);

    if (bootstrap) {
      await cake.bootstrapScript(scriptPath, toolsDir);
    }

    await cake.runScript(
      scriptPath,
      toolsDir,
      target,
      verbosity,
      scriptArgs
    );
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
