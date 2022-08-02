const dayjs = require('dayjs');
const fs = require('fs');

const getContent = () => {
  const getCommitHashShort = () =>
    require('child_process')
      .execSync('git rev-parse --short HEAD')
      .toString()
      .trim();

  const getCommitHash = () =>
    require('child_process').execSync('git rev-parse HEAD').toString().trim();

  return {
    display: getCommitHashShort(),
    version: `${getCommitHashShort()} - ${dayjs().format()}`,
    commit: getCommitHash(),
    date: dayjs().format(),
  };
};

const generateAppBuild = () => {
  console.log('✅ Generate `.app-build.json`');
  fs.writeFileSync('./.app-build.json', JSON.stringify(getContent(), null, 2));
};

generateAppBuild();
