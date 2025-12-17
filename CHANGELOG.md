# Changelog

## [0.10.5](https://github.com/Replikanti/flowlint-chrome/compare/flowlint-chrome-v0.10.4...flowlint-chrome-v0.10.5) (2025-12-17)


### Bug Fixes

* **ci:** enhance AI prompt to always mention core library upgrades ([bbf94b0](https://github.com/Replikanti/flowlint-chrome/commit/bbf94b09cde191c5be0254bb6b99726932e084a0))
* **ci:** enhance AI prompt to always mention core library upgrades ([f35a198](https://github.com/Replikanti/flowlint-chrome/commit/f35a198f9412ce84cfa993ae39a6cd301c3403f6))

## [0.10.4](https://github.com/Replikanti/flowlint-chrome/compare/flowlint-chrome-v0.10.3...flowlint-chrome-v0.10.4) (2025-12-17)


### Bug Fixes

* revert Tailwind v4 migration that broke Chrome extension UI ([01dcb63](https://github.com/Replikanti/flowlint-chrome/commit/01dcb639184957b9e0fb874bf74773ab38f0d2a0))

## [0.10.3](https://github.com/Replikanti/flowlint-chrome/compare/flowlint-chrome-v0.10.2...flowlint-chrome-v0.10.3) (2025-12-16)


### Bug Fixes

* **ci:** add standard CI workflow for PR checks ([033f4df](https://github.com/Replikanti/flowlint-chrome/commit/033f4df3386bc66cf912b8a29382275428bfd5ec))
* **ci:** unify CI workflows ([fe18cbc](https://github.com/Replikanti/flowlint-chrome/commit/fe18cbc3a9c498d9318ec11add6f37dd3407a3c4))

## [0.10.2](https://github.com/Replikanti/flowlint-chrome/compare/flowlint-chrome-v0.10.1...flowlint-chrome-v0.10.2) (2025-12-15)


### Bug Fixes

* **sonar:** remove history API monkey patching and use background messages for navigation ([1e23bd2](https://github.com/Replikanti/flowlint-chrome/commit/1e23bd216cff55094834911f6257561ef6c31766))

## [0.10.1](https://github.com/Replikanti/flowlint-chrome/compare/flowlint-chrome-v0.10.0...flowlint-chrome-v0.10.1) (2025-12-15)


### Bug Fixes

* **deps:** update dependency lucide-react to ^0.561.0 ([#69](https://github.com/Replikanti/flowlint-chrome/issues/69)) ([288cd94](https://github.com/Replikanti/flowlint-chrome/commit/288cd9476f9bc0c777d4c6781b26b60453e9eb67))

## [0.10.0](https://github.com/Replikanti/flowlint-chrome/compare/flowlint-chrome-v0.9.0...flowlint-chrome-v0.10.0) (2025-12-15)


### Features

* **ci:** add AI polish step to release-please workflow ([0606f00](https://github.com/Replikanti/flowlint-chrome/commit/0606f0043b03d85c9fc8659968e566f9de551306))
* **ci:** add ai release filtering script ([2751e50](https://github.com/Replikanti/flowlint-chrome/commit/2751e5070f7b900f5d7d2d27bfc7cb1886551f76))
* **ci:** add script to polish release notes with AI ([f8f726d](https://github.com/Replikanti/flowlint-chrome/commit/f8f726d14f72b0890d8955252ec02363c96ad9bb))
* **ci:** replace simple automerge with AI-assisted release gate ([e14a896](https://github.com/Replikanti/flowlint-chrome/commit/e14a896b340ed9e8bbc41a96daa5da83027b7046))
* trigger chrome release after build fixes ([780fafe](https://github.com/Replikanti/flowlint-chrome/commit/780fafea09e64e0464e32406ec73564708b75d5f))


### Bug Fixes

* **build:** migrate to @tailwindcss/postcss for compatibility ([d36a4ea](https://github.com/Replikanti/flowlint-chrome/commit/d36a4eaaa9c45e19764c4d0f49c5e445d96051fb))
* **build:** use @tailwindcss/postcss in postcss config ([f4e7970](https://github.com/Replikanti/flowlint-chrome/commit/f4e7970bc71c5b3ad02275ac0611c3fb1af2142b))
* **ci:** add checkout step before running polish script ([5b48293](https://github.com/Replikanti/flowlint-chrome/commit/5b482932b9d15aab3f6f846c7c8f5e0f1f112e5d))
* **ci:** correct repository name for chrome extension upload action ([3ccc7d9](https://github.com/Replikanti/flowlint-chrome/commit/3ccc7d9f1b07f6df8010063a99db4b0e17b2214f))
* **ci:** force fix commit type for flowlint-core updates to trigger releases ([0d4e393](https://github.com/Replikanti/flowlint-chrome/commit/0d4e3939e059ff16e6a41147b77a1ef96261e6f4))
* **ci:** make AI release filter strictly remove chores and ci spam ([534f718](https://github.com/Replikanti/flowlint-chrome/commit/534f718a978e5b02df777f44cbdbe34025575440))
* **ci:** switch to mnao305/chrome-extension-upload action due to resolution error ([1accd60](https://github.com/Replikanti/flowlint-chrome/commit/1accd603864b1af643114fab0d75315934b1b90d))
* **ci:** trigger automerge from release-please workflow to bypass bot limitations ([ca04048](https://github.com/Replikanti/flowlint-chrome/commit/ca04048bb1cc521c6ca158e72df5e0d4ae34cca0))
* **ci:** update automerge workflow to support repository_dispatch ([f70d18b](https://github.com/Replikanti/flowlint-chrome/commit/f70d18b268eb71a7fae44ce582fe5c646c073dc1))
* **deps:** add @octokit/rest to devDependencies for release polish script ([fee8b28](https://github.com/Replikanti/flowlint-chrome/commit/fee8b28d9c3b8c426f549ecb0e5c4c6a9ae5a74c))
* **deps:** add openai to devDependencies for release script ([ece8f20](https://github.com/Replikanti/flowlint-chrome/commit/ece8f20b50712e8edc5a4c4ad354ff1edb204394))
* **deps:** update @replikanti/flowlint-core to ^0.8.0 ([89d30f4](https://github.com/Replikanti/flowlint-chrome/commit/89d30f410da210654ad35648d2baf75c2bd725c8))
* final chrome publish test ([53a7d7f](https://github.com/Replikanti/flowlint-chrome/commit/53a7d7fcb1f0b4cb3842dc755c0a6d8810e68501))
* retry chrome release with fixed upload action ([71cb9eb](https://github.com/Replikanti/flowlint-chrome/commit/71cb9eb284ef073fed9ef82af8458adfbbfbfc32))
* trigger chrome extension release test ([d9b0df0](https://github.com/Replikanti/flowlint-chrome/commit/d9b0df037258468865fbfe616e45502c39c0da54))
* **types:** fix typescript error in release polish script ([8326254](https://github.com/Replikanti/flowlint-chrome/commit/83262545500b8e9bf24bbdebbd9df05f1521310d))
* update readme to trigger release ([77438fd](https://github.com/Replikanti/flowlint-chrome/commit/77438fd247cbed6e1af60028e121114523e81eaa))

## [0.9.0](https://github.com/Replikanti/flowlint-chrome/compare/flowlint-chrome-v0.8.4...flowlint-chrome-v0.9.0) (2025-12-15)


### Features

* trigger chrome release after build fixes ([780fafe](https://github.com/Replikanti/flowlint-chrome/commit/780fafea09e64e0464e32406ec73564708b75d5f))

## [0.8.4](https://github.com/Replikanti/flowlint-chrome/compare/flowlint-chrome-v0.8.3...flowlint-chrome-v0.8.4) (2025-12-15)


### Bug Fixes

* **build:** migrate to @tailwindcss/postcss for compatibility ([d36a4ea](https://github.com/Replikanti/flowlint-chrome/commit/d36a4eaaa9c45e19764c4d0f49c5e445d96051fb))
* **build:** use @tailwindcss/postcss in postcss config ([f4e7970](https://github.com/Replikanti/flowlint-chrome/commit/f4e7970bc71c5b3ad02275ac0611c3fb1af2142b))

## [0.8.3](https://github.com/Replikanti/flowlint-chrome/compare/flowlint-chrome-v0.8.2...flowlint-chrome-v0.8.3) (2025-12-15)


### Bug Fixes

* final chrome publish test ([53a7d7f](https://github.com/Replikanti/flowlint-chrome/commit/53a7d7fcb1f0b4cb3842dc755c0a6d8810e68501))

## [0.8.2](https://github.com/Replikanti/flowlint-chrome/compare/flowlint-chrome-v0.8.1...flowlint-chrome-v0.8.2) (2025-12-15)


### Bug Fixes

* **ci:** switch to mnao305/chrome-extension-upload action due to resolution error ([1accd60](https://github.com/Replikanti/flowlint-chrome/commit/1accd603864b1af643114fab0d75315934b1b90d))

## [0.8.1](https://github.com/Replikanti/flowlint-chrome/compare/flowlint-chrome-v0.8.0...flowlint-chrome-v0.8.1) (2025-12-15)


### Bug Fixes

* **ci:** correct repository name for chrome extension upload action ([3ccc7d9](https://github.com/Replikanti/flowlint-chrome/commit/3ccc7d9f1b07f6df8010063a99db4b0e17b2214f))
* retry chrome release with fixed upload action ([71cb9eb](https://github.com/Replikanti/flowlint-chrome/commit/71cb9eb284ef073fed9ef82af8458adfbbfbfc32))

## [0.8.0](https://github.com/Replikanti/flowlint-chrome/compare/flowlint-chrome-v0.7.0...flowlint-chrome-v0.8.0) (2025-12-15)


### Features

* **ci:** add AI polish step to release-please workflow ([0606f00](https://github.com/Replikanti/flowlint-chrome/commit/0606f0043b03d85c9fc8659968e566f9de551306))
* **ci:** add ai release filtering script ([2751e50](https://github.com/Replikanti/flowlint-chrome/commit/2751e5070f7b900f5d7d2d27bfc7cb1886551f76))
* **ci:** add automatic chrome web store publishing ([e19028a](https://github.com/Replikanti/flowlint-chrome/commit/e19028abc25263a00324fbd714830e7570639a98))
* **ci:** add script to polish release notes with AI ([f8f726d](https://github.com/Replikanti/flowlint-chrome/commit/f8f726d14f72b0890d8955252ec02363c96ad9bb))
* **ci:** replace simple automerge with AI-assisted release gate ([e14a896](https://github.com/Replikanti/flowlint-chrome/commit/e14a896b340ed9e8bbc41a96daa5da83027b7046))


### Bug Fixes

* **ci:** add checkout step before running polish script ([5b48293](https://github.com/Replikanti/flowlint-chrome/commit/5b482932b9d15aab3f6f846c7c8f5e0f1f112e5d))
* **ci:** force fix commit type for flowlint-core updates to trigger releases ([0d4e393](https://github.com/Replikanti/flowlint-chrome/commit/0d4e3939e059ff16e6a41147b77a1ef96261e6f4))
* **ci:** make AI release filter strictly remove chores and ci spam ([534f718](https://github.com/Replikanti/flowlint-chrome/commit/534f718a978e5b02df777f44cbdbe34025575440))
* **ci:** remove invalid bot user from CODEOWNERS ([e679684](https://github.com/Replikanti/flowlint-chrome/commit/e679684e326af68210654f0bb0e939730241f820))
* **ci:** trigger automerge from release-please workflow to bypass bot limitations ([ca04048](https://github.com/Replikanti/flowlint-chrome/commit/ca04048bb1cc521c6ca158e72df5e0d4ae34cca0))
* **ci:** update automerge workflow to support repository_dispatch ([f70d18b](https://github.com/Replikanti/flowlint-chrome/commit/f70d18b268eb71a7fae44ce582fe5c646c073dc1))
* **ci:** use PAT for auto-approve to satisfy code owners ([38530ca](https://github.com/Replikanti/flowlint-chrome/commit/38530cab326b264da6384ee26ffdb1130821be53))
* **ci:** use PAT for release auto-approve to enable cascading releases ([1b47f53](https://github.com/Replikanti/flowlint-chrome/commit/1b47f536cbb34c726bb785d76da3b1b497759f27))
* **ci:** use tag v4 for auto-approve-action to fix download error ([641dca2](https://github.com/Replikanti/flowlint-chrome/commit/641dca2e54fe18639dc67719d9fd0b5223cc8a21))
* **deps:** add @octokit/rest to devDependencies for release polish script ([fee8b28](https://github.com/Replikanti/flowlint-chrome/commit/fee8b28d9c3b8c426f549ecb0e5c4c6a9ae5a74c))
* **deps:** add openai to devDependencies for release script ([ece8f20](https://github.com/Replikanti/flowlint-chrome/commit/ece8f20b50712e8edc5a4c4ad354ff1edb204394))
* **deps:** update @replikanti/flowlint-core to ^0.8.0 ([89d30f4](https://github.com/Replikanti/flowlint-chrome/commit/89d30f410da210654ad35648d2baf75c2bd725c8))
* trigger chrome extension release test ([d9b0df0](https://github.com/Replikanti/flowlint-chrome/commit/d9b0df037258468865fbfe616e45502c39c0da54))
* **types:** fix typescript error in release polish script ([8326254](https://github.com/Replikanti/flowlint-chrome/commit/83262545500b8e9bf24bbdebbd9df05f1521310d))
* update readme to trigger release ([77438fd](https://github.com/Replikanti/flowlint-chrome/commit/77438fd247cbed6e1af60028e121114523e81eaa))
