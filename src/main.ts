import * as core from '@actions/core';

import * as apiService from './api.service';

async function run() {
  try {
    const buildInput = await apiService.getBuildInput();
    const watchUrl = await apiService.createBuild(buildInput);
    await apiService.watchBuild(watchUrl);
  } catch (error: any) {
    core.error(error.message);
    core.setFailed(error.message);
  }
}

run();
