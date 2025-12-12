//=============================================================================
// 武器アニメーション変更プラグイン
// EXC_ReplaceWeaponAnimation.js
// ----------------------------------------------------------------------------
// Copyright (c) 2024 IdiotException
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2024-12-12
//=============================================================================
/*:
 * @target MZ
 * @plugindesc 武器攻撃のアニメーションを差し替えることができます
 * @author IdiotException
 * @url https://github.com/IdiotException/EXC_ReplaceWeaponAnimation
 * @help 特定のステートがアクターに付与されている場合に
 * 武器攻撃のアニメーションを差し替えることができます。
 * 
 * 対象武器リストのいずれかが装備中の武器に一致し、
 * かつ対象ステートのいずれかがアクターに付与されている場合に
 * 差し替えアニメーションのアニメーションに武器攻撃のアニメーションが
 * 差し変わります。
 * 
 * 利用規約
 *   MITライセンスです。
 *   作者に無断で改変、再配布が可能で、
 *   利用形態（商用、18禁利用等）についても制限はありません。
 * 
 * @param replaceList
 * @text 変更設定リスト
 * @desc 変更対象と状態のリストです
 * @default []
 * @type struct<replaceSettings>[]
 */
/*~struct~replaceSettings:
 *
 * @param weapons
 * @text 対象武器リスト
 * @desc 差し替え対象となる武器のリストです
 * @type weapon[]
 *
 * @param states
 * @text 対象ステート
 * @desc 差し替え対象となるステートのリストです
 * @type state[]
 *
 * @param animation
 * @text 差し替えアニメーション
 * @desc 差し変わるアニメーションです
 * @type animation
 */
const EXCReplaceWeaponAnimation = document.currentScript.src.match(/^.*\/(.+)\.js$/)[1];

(function() {
	"use strict";

	//パラメータ受取処理
	const parameters	= PluginManager.parameters(EXCReplaceWeaponAnimation);
	const tmpArray		= JSON.parse(parameters["replaceList"] || "[]");
	let _replaceList = [];
	for (const replaceSettings of tmpArray) {
		let tmpSettings = JSON.parse(replaceSettings);
		// テキストを配列に変換
		tmpSettings.weapons = JSON.parse(tmpSettings.weapons || "[]");
		tmpSettings.states = JSON.parse(tmpSettings.states || "[]");
		_replaceList.push(tmpSettings);
	}

	//--------------------------------------------------
	// Game_Actor のオーバーライド
	//--------------------------------------------------
	// 差し替え用の処理を追加
	const _EXC_Game_Actor_attackAnimationId1 = Game_Actor.prototype.attackAnimationId1;
	Game_Actor.prototype.attackAnimationId1 = function() {
		let ret = _EXC_Game_Actor_attackAnimationId1.call(this);

		const weapons = this.weapons();
		if (!this.hasNoWeapons() && weapons[0]) {
			ret = this.replaceAttackAnimation(weapons[0]);
		}

		return ret;
	};
	
	// 差し替え用の処理を追加
	const _EXC_Game_Actor_attackAnimationId2 = Game_Actor.prototype.attackAnimationId2;
	Game_Actor.prototype.attackAnimationId2 = function() {
		let ret = _EXC_Game_Actor_attackAnimationId2.call(this);

		const weapons = this.weapons();
		if (weapons[1]) {
			ret = this.replaceAttackAnimation(weapons[1]);
		}

		return ret;
	};

	// 差し替え処理関数
	Game_Actor.prototype.replaceAttackAnimation = function(weapon) {
		
		// デフォルトは武器のアニメーションID
		let ret = weapon.animationId

		// 武器が一致する条件が存在するか
		const tmpSettings = _replaceList.filter(el => el.weapons.includes(weapon.id.toString()));
		if(tmpSettings){
			for(let i = 0; i < tmpSettings.length; i++){
				// ステートが一致する条件が存在するか
				const states = this.states();
				let exists = states.filter(el => tmpSettings[i].states.includes(el.id.toString()));
				if(exists && exists.length > 0){
					// 両方の条件を満たす場合、攻撃アニメーションを差し替え
					ret = tmpSettings[i].animation;
					break;
				}
			}
		}

		return ret;
	}

})();

