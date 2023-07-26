import * as github from '@actions/github';
import * as core from '@actions/core';

import {
  BuildCreationError,
  buildEndedStatuses,
  BuildResponse,
  CreateBuildInput,
  LogsResponse,
  LogQueryError
} from './types';

const baseUrl = 'https://api.nanoapi.io';

export const getBuildInput = async (): Promise<CreateBuildInput> => {
  let buildInput: CreateBuildInput;

  const token = core.getInput('token');
  core.info('Using API key: *** and starting build...');

  // Get github context data
  const context = github.context;
  console.log(
    `We can even get context data, like the repo: ${context.repo.repo}`
  );

  const repoName = context.repo.repo;
  const repoOwner = context.repo.owner;
  const branch = context.ref.replace('refs/heads/', '');
  const commitSHA = context.sha;

  // Get the repo id via the octokit API
  // @ts-ignore
  const octokit = github.getOctokit(token);
  const {data: repoData} = await octokit.rest.repos.get({
    owner: repoOwner,
    repo: repoName
  });

  const repoId = repoData.id;

  return {
    repoId,
    repoName,
    repoOwner,
    branch,
    commitSHA
  };
};

export const createBuild = async (
  buildInput: CreateBuildInput
): Promise<string> => {
  // Make the request to the Nano-API servers to start the build.
  const apiKey = core.getInput('api_key');
  const response = await fetch(`${baseUrl}/api/v1/builds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(buildInput)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new BuildCreationError(error.message);
  }

  const resJSON: BuildResponse = await response.json();
  core.info(`Build started: ${resJSON.build.id}`);
  return resJSON.url;
};

// Query the api every 5 seconds until the build is complete.
export const watchBuild = async (
  url: string
): Promise<void> => {
  const apiKey = core.getInput('api_key');

  let resJSON: LogsResponse;
  do {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new LogQueryError(error.message);
    }

    resJSON = await response.json();
    core.info(resJSON.data);
    await new Promise((resolve) => setTimeout(resolve, 5000));
  } while (!buildEndedStatuses.includes(resJSON.status));
};
