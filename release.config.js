module.exports = {
  repositoryUrl: 'https://github.com/PolymeshAssociation/confidential-polymesh-rest-api.git',
  branches: [
    'master',
    {
      name: 'alpha',
      prerelease: true,
    },
    {
      name: 'confidential-assets',
      prerelease: true,
    },
  ],

  // Note, the expectation is for Github plugin to create a tag that begins with `v`, which triggers a workflow that publishes a docker image
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release/exec',
      {
        // eslint-disable-next-line no-template-curly-in-string
        prepareCmd: './prepareRelease.sh ${nextRelease.version}',
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'src/main.ts'],
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: ['CHANGELOG.md', 'confidential-polymesh-rest-api-swagger-spec.json'],
      },
    ],
  ],
};
