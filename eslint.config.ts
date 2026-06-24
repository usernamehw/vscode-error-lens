import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Linter } from 'eslint';
import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type LegacyRuleSeverity = 0 | 1 | 2 | 'off' | 'warn' | 'error';
type LegacyRuleConfig = LegacyRuleSeverity | [LegacyRuleSeverity, ...unknown[]];
type LegacyRulesRecord = Record<string, LegacyRuleConfig>;

function normalizeRuleSeverity(severity: LegacyRuleSeverity): Linter.RuleSeverity {
	switch (severity) {
		case 0:
		case 'off':
			return 'off';
		case 1:
		case 'warn':
			return 'warn';
		case 2:
		case 'error':
			return 'error';
	}
}

function normalizeRuleConfig(ruleConfig: LegacyRuleConfig): Linter.RuleEntry {
	if (Array.isArray(ruleConfig)) {
		const [severity, ...options] = ruleConfig;
		return [normalizeRuleSeverity(severity), ...options];
	}

	return normalizeRuleSeverity(ruleConfig);
}

function normalizeRules(rules: LegacyRulesRecord): Linter.RulesRecord {
	const normalizedRules: Linter.RulesRecord = {};

	for (const [ruleName, ruleConfig] of Object.entries(rules)) {
		normalizedRules[ruleName] = normalizeRuleConfig(ruleConfig);
	}

	return normalizedRules;
}

function defineLegacyRules<const TRules extends LegacyRulesRecord>(rules: TRules): TRules {
	return rules;
}

const typeScriptRuleDefinitions = defineLegacyRules({
	"@typescript-eslint/adjacent-overload-signatures": 1,
	"@typescript-eslint/array-type": [
		1,
		{
			"default": "array"
		}
	],
	"@typescript-eslint/await-thenable": 1,
	"@typescript-eslint/ban-ts-comment": [
		0,
		{
			"ts-expect-error": "allow-with-description",
			"ts-ignore": "allow-with-description"
		}
	],
	"@typescript-eslint/ban-tslint-comment": 1,
	"@typescript-eslint/class-literal-property-style": 1,
	"@typescript-eslint/consistent-generic-constructors": 1,
	"@typescript-eslint/consistent-indexed-object-style": 0,
	"@typescript-eslint/consistent-type-assertions": [
		1,
		{
			"assertionStyle": "as",
			"objectLiteralTypeAssertions": "allow-as-parameter"
		}
	],
	"@typescript-eslint/consistent-type-definitions": [
		1,
		"interface"
	],
	"@typescript-eslint/consistent-type-exports": [
		1,
		{
			"fixMixedExportsWithInlineTypeSpecifier": true
		}
	],
	"@typescript-eslint/consistent-type-imports": [
		0,
		{
			"fixStyle": "inline-type-imports"
		}
	],
	"@typescript-eslint/explicit-function-return-type": [
		1,
		{
			"allowExpressions": true,
			"allowTypedFunctionExpressions": true,
			"allowHigherOrderFunctions": true,
			"allowDirectConstAssertionInArrowFunctions": true,
			"allowConciseArrowFunctionExpressionsStartingWithVoid": false,
			"allowFunctionsWithoutTypeParameters": false,
			"allowedNames": [],
			"allowIIFEs": false
		}
	],
	"@typescript-eslint/explicit-member-accessibility": [
		0,
		{
			"overrides": {
				"accessors": "explicit",
				"constructors": "off",
				"methods": "explicit",
				"properties": "explicit",
				"parameterProperties": "explicit"
			}
		}
	],
	"@typescript-eslint/explicit-module-boundary-types": [
		0,
		{
			"allowArgumentsExplicitlyTypedAsAny": false,
			"allowDirectConstAssertionInArrowFunctions": true,
			"allowedNames": [],
			"allowHigherOrderFunctions": true,
			"allowTypedFunctionExpressions": true
		}
	],
	"@typescript-eslint/member-ordering": 1,
	"@typescript-eslint/method-signature-style": 1,
	"@typescript-eslint/naming-convention": [
		1,
		{
			"selector": [
				"variable",
				"function",
				"classProperty",
				"parameterProperty",
				"classMethod",
				"objectLiteralMethod",
				"typeMethod",
				"accessor"
			],
			"format": [
				"strictCamelCase"
			],
			"filter": {
				"regex": "[_|__]",
				"match": false
			}
		},
		{
			"selector": [
				"class",
				"enumMember",
				"interface",
				"typeLike",
				"typeAlias",
				"typeParameter"
			],
			"format": [
				"StrictPascalCase"
			]
		}
	],
	"@typescript-eslint/no-base-to-string": 1,
	"@typescript-eslint/no-confusing-non-null-assertion": 1,
	"@typescript-eslint/no-confusing-void-expression": 1,
	"@typescript-eslint/no-duplicate-enum-values": 1,
	"@typescript-eslint/no-dynamic-delete": 0,
	"@typescript-eslint/no-explicit-any": 1,
	"@typescript-eslint/no-extra-non-null-assertion": 1,
	"@typescript-eslint/no-extraneous-class": 0,
	"@typescript-eslint/no-floating-promises": [
		0,
		{
			"ignoreVoid": true,
			"ignoreIIFE": false
		}
	],
	"@typescript-eslint/no-for-in-array": 1,
	"@typescript-eslint/no-import-type-side-effects": 0,
	"@typescript-eslint/no-inferrable-types": 1,
	"@typescript-eslint/no-invalid-void-type": 1,
	"@typescript-eslint/no-meaningless-void-operator": 1,
	"@typescript-eslint/no-misused-new": 1,
	"@typescript-eslint/no-misused-promises": [
		1,
		{
			"checksConditionals": true,
			"checksVoidReturn": false,
			"checksSpreads": true
		}
	],
	"@typescript-eslint/no-mixed-enums": 1,
	"@typescript-eslint/no-namespace": 1,
	"@typescript-eslint/no-non-null-asserted-nullish-coalescing": 1,
	"@typescript-eslint/no-non-null-asserted-optional-chain": 1,
	"@typescript-eslint/no-non-null-assertion": 0,
	"@typescript-eslint/no-redundant-type-constituents": 1,
	"@typescript-eslint/no-require-imports": 1,
	"@typescript-eslint/no-this-alias": [
		1,
		{
			"allowDestructuring": true
		}
	],
	"@typescript-eslint/no-unnecessary-boolean-literal-compare": 1,
	"@typescript-eslint/no-unnecessary-condition": 0,
	"@typescript-eslint/no-unnecessary-qualifier": 1,
	"@typescript-eslint/no-unnecessary-type-arguments": 1,
	"@typescript-eslint/no-unnecessary-type-assertion": 1,
	"@typescript-eslint/no-unnecessary-type-constraint": 1,
	"@typescript-eslint/no-unsafe-argument": 1,
	"@typescript-eslint/no-unsafe-assignment": 1,
	"@typescript-eslint/no-unsafe-call": 1,
	"@typescript-eslint/no-unsafe-declaration-merging": 1,
	"@typescript-eslint/no-unsafe-member-access": 1,
	"@typescript-eslint/no-unsafe-return": 1,
	"@typescript-eslint/no-useless-empty-export": 1,
	"@typescript-eslint/non-nullable-type-assertion-style": 1,
	"@typescript-eslint/parameter-properties": 1,
	"@typescript-eslint/prefer-as-const": 1,
	"@typescript-eslint/prefer-enum-initializers": 0,
	"@typescript-eslint/prefer-for-of": 1,
	"@typescript-eslint/prefer-function-type": 1,
	"@typescript-eslint/prefer-includes": 1,
	"@typescript-eslint/prefer-literal-enum-member": 0,
	"@typescript-eslint/no-unsafe-enum-comparison": 0,
	"@typescript-eslint/prefer-namespace-keyword": 1,
	"@typescript-eslint/prefer-nullish-coalescing": [
		1,
		{
			"ignoreConditionalTests": false,
			"ignoreTernaryTests": false,
			"ignoreMixedLogicalExpressions": false,
			"allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing": false
		}
	],
	"@typescript-eslint/prefer-optional-chain": 1,
	"@typescript-eslint/prefer-readonly": 1,
	"@typescript-eslint/prefer-readonly-parameter-types": [
		0,
		{
			"checkParameterProperties": true,
			"ignoreInferredTypes": true,
			"treatMethodsAsReadonly": false
		}
	],
	"@typescript-eslint/prefer-reduce-type-parameter": 1,
	"@typescript-eslint/prefer-regexp-exec": 1,
	"@typescript-eslint/prefer-return-this-type": 1,
	"@typescript-eslint/prefer-string-starts-ends-with": 1,
	"@typescript-eslint/promise-function-async": 1,
	"@typescript-eslint/require-array-sort-compare": 1,
	"@typescript-eslint/restrict-plus-operands": 1,
	"@typescript-eslint/restrict-template-expressions": [
		1,
		{
			"allowNumber": true,
			"allowBoolean": false,
			"allowAny": false,
			"allowNullish": false,
			"allowRegExp": false
		}
	],
	"@typescript-eslint/strict-boolean-expressions": 0,
	"@typescript-eslint/switch-exhaustiveness-check": 1,
	"@typescript-eslint/triple-slash-reference": [
		1,
		{
			"path": "never",
			"types": "never",
			"lib": "never"
		}
	],
	"@typescript-eslint/unbound-method": 0,
	"@typescript-eslint/unified-signatures": [
		1,
		{
			"ignoreDifferentlyNamedParameters": true
		}
	],
	"default-param-last": 0,
	"@typescript-eslint/default-param-last": 1,
	"dot-notation": 0,
	"@typescript-eslint/dot-notation": 1,
	"init-declarations": 0,
	"@typescript-eslint/init-declarations": 0,
	"no-array-constructor": 0,
	"@typescript-eslint/no-array-constructor": 1,
	"no-dupe-class-members": 0,
	"@typescript-eslint/no-dupe-class-members": 1,
	"no-empty-function": 0,
	"@typescript-eslint/no-empty-function": 0,
	"no-implied-eval": 0,
	"@typescript-eslint/no-implied-eval": 1,
	"no-invalid-this": 0,
	"@typescript-eslint/no-invalid-this": 1,
	"no-loop-func": 0,
	"@typescript-eslint/no-loop-func": 1,
	"no-loss-of-precision": 0,
	"no-magic-numbers": 0,
	"@typescript-eslint/no-magic-numbers": [
		0,
		{
			"ignoreEnums": true,
			"ignoreArrayIndexes": true,
			"ignoreNumericLiteralTypes": false,
			"ignoreReadonlyClassProperties": false,
			"ignoreTypeIndexes": false
		}
	],
	"no-redeclare": 0,
	"@typescript-eslint/no-redeclare": 1,
	"no-restricted-imports": 0,
	"@typescript-eslint/no-restricted-imports": 1,
	"no-shadow": 0,
	"@typescript-eslint/no-shadow": 1,
	"no-throw-literal": 0,
	"no-unused-expressions": 0,
	"@typescript-eslint/no-unused-expressions": 1,
	"no-unused-vars": 0,
	"@typescript-eslint/no-unused-vars": 0,
	"no-use-before-define": 0,
	"@typescript-eslint/no-use-before-define": 0,
	"no-useless-constructor": 0,
	"@typescript-eslint/no-useless-constructor": 1,
	"require-await": 0,
	"@typescript-eslint/require-await": 1,
	"@typescript-eslint/return-await": 1,
	"array-callback-return": 1,
	"constructor-super": 1,
	"for-direction": 1,
	"getter-return": 1,
	"no-async-promise-executor": 1,
	"no-await-in-loop": 1,
	"no-class-assign": 1,
	"no-compare-neg-zero": 1,
	"no-cond-assign": [
		1,
		"always"
	],
	"no-const-assign": 1,
	"no-constant-binary-expression": 1,
	"no-constant-condition": 1,
	"no-constructor-return": 1,
	"no-control-regex": 1,
	"no-debugger": 1,
	"no-dupe-args": 1,
	"no-dupe-else-if": 1,
	"no-dupe-keys": 1,
	"no-duplicate-case": 1,
	"no-empty-character-class": 1,
	"no-empty-pattern": 1,
	"no-ex-assign": 1,
	"no-fallthrough": 1,
	"no-func-assign": 1,
	"no-import-assign": 1,
	"no-inner-declarations": 1,
	"no-invalid-regexp": 1,
	"no-irregular-whitespace": 1,
	"no-misleading-character-class": 1,
	"no-new-native-nonconstructor": 1,
	"no-new-symbol": 1,
	"no-obj-calls": 1,
	"no-promise-executor-return": 1,
	"no-prototype-builtins": 1,
	"no-self-assign": 1,
	"no-self-compare": 1,
	"no-setter-return": 1,
	"no-sparse-arrays": 1,
	"no-template-curly-in-string": 0,
	"no-this-before-super": 1,
	"no-undef": 0,
	"no-unexpected-multiline": 1,
	"no-unmodified-loop-condition": 1,
	"no-unreachable": 0,
	"no-unreachable-loop": 1,
	"no-unsafe-finally": 1,
	"no-unsafe-negation": [
		1,
		{
			"enforceForOrderingRelations": true
		}
	],
	"no-unsafe-optional-chaining": 1,
	"no-unused-private-class-members": 1,
	"no-useless-backreference": 1,
	"require-atomic-updates": 1,
	"use-isnan": 1,
	"valid-typeof": [
		1,
		{
			"requireStringLiterals": true
		}
	],
	"accessor-pairs": [
		1,
		{
			"setWithoutGet": true,
			"getWithoutSet": false,
			"enforceForClassMembers": true
		}
	],
	"arrow-body-style": [
		1,
		"as-needed"
	],
	"block-scoped-var": 1,
	"camelcase": 0,
	"capitalized-comments": [
		0,
		"always",
		{
			"ignoreInlineComments": true,
			"ignoreConsecutiveComments": true
		}
	],
	"class-methods-use-this": 0,
	"complexity": [
		0,
		20
	],
	"consistent-return": 0,
	"consistent-this": 0,
	"curly": 1,
	"default-case": 1,
	"default-case-last": 1,
	"eqeqeq": [
		1,
		"always"
	],
	"func-name-matching": [
		1,
		{
			"considerPropertyDescriptor": true
		}
	],
	"func-names": [
		1,
		"never"
	],
	"func-style": [
		1,
		"declaration",
		{
			"allowArrowFunctions": true
		}
	],
	"grouped-accessor-pairs": [
		1,
		"getBeforeSet"
	],
	"guard-for-in": 0,
	"id-denylist": 0,
	"id-length": 0,
	"id-match": 0,
	"logical-assignment-operators": [
		1,
		"always"
	],
	"max-classes-per-file": [
		1,
		{
			"ignoreExpressions": true,
			"max": 1
		}
	],
	"max-depth": [
		1,
		{
			"max": 5
		}
	],
	"max-lines": 0,
	"max-lines-per-function": [
		0,
		{
			"max": 50,
			"skipBlankLines": true,
			"skipComments": true,
			"IIFEs": false
		}
	],
	"max-nested-callbacks": [
		1,
		{
			"max": 4
		}
	],
	"max-params": [
		1,
		{
			"max": 4
		}
	],
	"max-statements": 0,
	"new-cap": 1,
	"no-alert": 1,
	"no-bitwise": 1,
	"no-caller": 1,
	"no-case-declarations": 1,
	"no-console": 0,
	"no-continue": 0,
	"no-delete-var": 1,
	"no-div-regex": 1,
	"no-else-return": [
		0,
		{
			"allowElseIf": false
		}
	],
	"no-empty": 0,
	"no-empty-static-block": 0,
	"no-eq-null": 1,
	"no-eval": 1,
	"no-extend-native": 1,
	"no-extra-bind": 1,
	"no-extra-boolean-cast": 1,
	"no-extra-label": 1,
	"no-global-assign": 1,
	"no-implicit-coercion": 1,
	"no-implicit-globals": 1,
	"no-inline-comments": 0,
	"no-iterator": 1,
	"no-label-var": 1,
	"no-labels": 0,
	"no-lone-blocks": 1,
	"no-lonely-if": 0,
	"no-multi-assign": 1,
	"no-multi-str": 1,
	"no-negated-condition": 1,
	"no-nested-ternary": 0,
	"no-new": 1,
	"no-new-func": 1,
	"no-new-object": 1,
	"no-new-wrappers": 1,
	"no-nonoctal-decimal-escape": 1,
	"no-octal": 1,
	"no-octal-escape": 1,
	"no-param-reassign": [
		0,
		{
			"props": true,
			"ignorePropertyModificationsFor": [
				"editor",
				"range"
			]
		}
	],
	"no-plusplus": 0,
	"no-proto": 1,
	"no-regex-spaces": 1,
	"no-return-assign": 1,
	"no-script-url": 1,
	"no-sequences": 1,
	"no-shadow-restricted-names": 1,
	"no-ternary": 0,
	"no-undef-init": 1,
	"no-undefined": 0,
	"no-underscore-dangle": 0,
	"no-unneeded-ternary": 1,
	"no-unused-labels": 1,
	"no-useless-call": 1,
	"no-useless-catch": 1,
	"no-useless-computed-key": [
		1,
		{
			"enforceForClassMembers": true
		}
	],
	"no-useless-concat": 1,
	"no-useless-escape": 1,
	"no-useless-rename": 1,
	"no-useless-return": 1,
	"no-var": 1,
	"no-void": 1,
	"no-warning-comments": 0,
	"no-with": 1,
	"object-shorthand": 1,
	"one-var": [
		1,
		"never"
	],
	"operator-assignment": [
		1,
		"always"
	],
	"prefer-arrow-callback": [
		1,
		{
			"allowNamedFunctions": true
		}
	],
	"prefer-const": 1,
	"prefer-destructuring": 0,
	"prefer-exponentiation-operator": 1,
	"prefer-named-capture-group": 1,
	"prefer-numeric-literals": 1,
	"prefer-object-has-own": 1,
	"prefer-object-spread": 1,
	"prefer-promise-reject-errors": [
		1,
		{
			"allowEmptyReject": true
		}
	],
	"prefer-regex-literals": [
		1,
		{
			"disallowRedundantWrapping": true
		}
	],
	"prefer-rest-params": 1,
	"prefer-spread": 1,
	"prefer-template": 1,
	"radix": 1,
	"require-unicode-regexp": 1,
	"require-yield": 1,
	"sort-imports": 0,
	"sort-keys": 0,
	"sort-vars": 0,
	"strict": 0,
	"symbol-description": 1,
	"vars-on-top": 0,
	"yoda": 1,
	"unicode-bom": [
		1,
		"never"
	],
	"@stylistic/no-extra-semi": 1,
	"@stylistic/block-spacing": [
		1,
		"always"
	],
	"@stylistic/brace-style": [
		1,
		"1tbs",
		{
			"allowSingleLine": false
		}
	],
	"@stylistic/comma-dangle": [
		1,
		"always-multiline"
	],
	"@stylistic/comma-spacing": [
		1,
		{
			"before": false,
			"after": true
		}
	],
	"@stylistic/function-call-spacing": 1,
	"@stylistic/indent": [
		1,
		"tab",
		{
			"SwitchCase": 1,
			"flatTernaryExpressions": false,
			"ignoredNodes": [
				"PropertyDefinition[decorators]",
				"TSUnionType",
				"FunctionExpression[params]:has(Identifier[decorators])"
			]
		}
	],
	"@stylistic/key-spacing": [
		1,
		{
			"singleLine": {
				"beforeColon": false,
				"afterColon": true
			},
			"multiLine": {
				"beforeColon": false,
				"afterColon": true
			}
		}
	],
	"@stylistic/keyword-spacing": [
		1,
		{
			"before": true,
			"after": true
		}
	],
	"@stylistic/lines-around-comment": 0,
	"@stylistic/lines-between-class-members": [
		1,
		"always",
		{
			"exceptAfterSingleLine": true,
			"exceptAfterOverload": true
		}
	],
	"@stylistic/member-delimiter-style": [
		1,
		{
			"multiline": {
				"delimiter": "semi",
				"requireLast": true
			},
			"singleline": {
				"delimiter": "semi",
				"requireLast": false
			}
		}
	],
	"@stylistic/no-extra-parens": 0,
	"@stylistic/object-curly-spacing": [
		1,
		"always"
	],
	"@stylistic/padding-line-between-statements": [
		0,
		{
			"blankLine": "always",
			"prev": "multiline-block-like",
			"next": "*"
		},
		{
			"blankLine": "always",
			"prev": "*",
			"next": "return"
		}
	],
	"@stylistic/quotes": [
		1,
		"single",
		{
			"allowTemplateLiterals": "always"
		}
	],
	"@stylistic/semi": [
		1,
		"always"
	],
	"@stylistic/space-before-blocks": [
		1,
		"always"
	],
	"@stylistic/space-before-function-paren": [
		1,
		{
			"anonymous": "always",
			"named": "never",
			"asyncArrow": "always"
		}
	],
	"@stylistic/space-infix-ops": 1,
	"@stylistic/type-annotation-spacing": [
		1,
		{
			"before": false,
			"after": true
		}
	],
	"@typescript-eslint/no-restricted-types": [
		1,
		{
			"types": {
				"null": {
					"message": "Use `undefined` instead.",
					"fixWith": "undefined"
				},
				"Object": true
			}
		}
	],
	"@typescript-eslint/no-wrapper-object-types": 1,
	"@typescript-eslint/no-unsafe-function-type": 1,
	"@stylistic/multiline-comment-style": 0,
	"@stylistic/no-confusing-arrow": 0,
	"@stylistic/no-floating-decimal": 1,
	"@stylistic/no-mixed-operators": 1,
	"@stylistic/one-var-declaration-per-line": [
		1,
		"always"
	],
	"@stylistic/quote-props": [
		1,
		"as-needed"
	],
	"@stylistic/spaced-comment": [
		1,
		"always",
		{
			"exceptions": [
				"/"
			]
		}
	],
	"@stylistic/array-bracket-newline": [
		1,
		"consistent"
	],
	"@stylistic/array-bracket-spacing": [
		1,
		"never"
	],
	"@stylistic/array-element-newline": [
		1,
		"consistent"
	],
	"@stylistic/arrow-parens": [
		1,
		"as-needed",
		{
			"requireForBlockBody": false
		}
	],
	"@stylistic/arrow-spacing": [
		1,
		{
			"before": true,
			"after": true
		}
	],
	"@stylistic/comma-style": [
		1,
		"last"
	],
	"@stylistic/computed-property-spacing": [
		1,
		"never"
	],
	"@stylistic/dot-location": [
		1,
		"property"
	],
	"@stylistic/eol-last": 1,
	"@stylistic/function-call-argument-newline": [
		1,
		"consistent"
	],
	"@stylistic/function-paren-newline": [
		1,
		"consistent"
	],
	"@stylistic/generator-star-spacing": [
		1,
		{
			"before": true,
			"after": false
		}
	],
	"@stylistic/implicit-arrow-linebreak": 1,
	"@stylistic/jsx-quotes": [
		1,
		"prefer-single"
	],
	"@stylistic/line-comment-position": 0,
	"@stylistic/linebreak-style": [
		1,
		"unix"
	],
	"@stylistic/max-len": [
		0,
		100
	],
	"@stylistic/max-statements-per-line": [
		1,
		{
			"max": 1
		}
	],
	"@stylistic/multiline-ternary": [
		1,
		"always-multiline"
	],
	"@stylistic/new-parens": 1,
	"@stylistic/newline-per-chained-call": [
		0,
		{
			"ignoreChainWithDepth": 2
		}
	],
	"@stylistic/no-mixed-spaces-and-tabs": [
		1,
		"smart-tabs"
	],
	"@stylistic/no-multi-spaces": 1,
	"@stylistic/no-multiple-empty-lines": [
		1,
		{
			"max": 1
		}
	],
	"@stylistic/no-tabs": 0,
	"@stylistic/no-trailing-spaces": 0,
	"@stylistic/no-whitespace-before-property": 1,
	"@stylistic/nonblock-statement-body-position": 0,
	"@stylistic/object-curly-newline": 1,
	"@stylistic/object-property-newline": 0,
	"@stylistic/operator-linebreak": [
		1,
		"after"
	],
	"@stylistic/padded-blocks": [
		1,
		"never"
	],
	"@stylistic/rest-spread-spacing": 1,
	"@stylistic/semi-spacing": 1,
	"@stylistic/semi-style": 1,
	"@stylistic/space-in-parens": [
		1,
		"never"
	],
	"@stylistic/space-unary-ops": 1,
	"@stylistic/switch-colon-spacing": [
		1,
		{
			"after": true,
			"before": false
		}
	],
	"@stylistic/template-curly-spacing": [
		1,
		"never"
	],
	"@stylistic/template-tag-spacing": [
		1,
		"never"
	],
	"@stylistic/wrap-iife": 1,
	"@stylistic/wrap-regex": 0,
	"@stylistic/yield-star-spacing": [
		1,
		{
			"before": true,
			"after": false
		}
	]
});

const exampleMjsRuleDefinitions = defineLegacyRules({
	"eqeqeq": [
		2,
		"always"
	],
	"no-constant-condition": 2,
	"no-undef": 2,
	"no-unused-vars": 2,
	"no-use-before-define": 2,
	"no-var": 2,
	"prefer-const": 2
});

const typeScriptRules = normalizeRules(typeScriptRuleDefinitions);
const exampleMjsRules = normalizeRules(exampleMjsRuleDefinitions);

export default defineConfig(
	{
		name: 'project/ignores',
		ignores: ['artifacts/**', 'dist/**', 'node_modules/**', '.pnpm/**', '.vscode-test/**'],
	},
	{
		name: 'project/typescript',
		files: ['src/**/*.ts'],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommendedTypeChecked,
			tseslint.configs.strictTypeChecked,
		],
		languageOptions: {
			parser: tseslint.parser,
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: {
				projectService: true,
				tsconfigRootDir: __dirname,
			},
			globals: {
				...globals.node,
				...globals.es2020,
			},
		},
		plugins: {
			'@stylistic': stylistic,
			'@typescript-eslint': tseslint.plugin,
		},
		rules: typeScriptRules,
	},
	{
		name: 'project/examples-mjs',
		files: ['examples/**/*.mjs'],
		extends: [js.configs.recommended],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.node,
				...globals.es2020,
			},
		},
		rules: exampleMjsRules,
	},
);
