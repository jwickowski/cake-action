import * as core from '@actions/core';
import { ToolsDirectory } from './toolsDirectory';
import * as dotnet from './dotnet';
import * as cake from './cake';
import { CakeArgument } from './cakeParameter';

export async function run() {
  try {
    const scriptPath = core.getInput('script-path');
    const version = core.getInput('cake-version');
    const bootstrap = (core.getInput('cake-bootstrap') || '').toLowerCase() === 'true';
    const target = new CakeArgument('target', core.getInput('target'));
    const verbosity = new CakeArgument('verbosity', core.getInput('verbosity'));
    const scriptArguments = getScriptArguments();

    const toolsDir = new ToolsDirectory();
    toolsDir.create();

    dotnet.disableTelemetry();
    dotnet.disableWelcomeMessage();

    await dotnet.installLocalCakeTool(toolsDir, version);

    if (bootstrap) {
      await cake.bootstrapScript(scriptPath, toolsDir);
    }

    await cake.runScript(scriptPath, toolsDir, target, verbosity, ...scriptArguments);
  } catch (error) {
    core.setFailed(error.message);
  }
}

function getScriptArguments(): CakeArgument[] {
  const result: CakeArgument[] = [];
  const input: any = core.getInput('script-arguments');
  const argumentsKeys: string[] = Object.keys(input);

  argumentsKeys.map(argumentKey => {
      const cakeArgument = new CakeArgument('argumentKey', input[argumentKey]);
      result.push(cakeArgument);
  });
  return result;
}

run();
