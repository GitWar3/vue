// 1.onmousedown：鼠标按下事件
// 2.onmousemove:鼠标移动事件
// 3.onmouseup:鼠标抬起事件

// position: relative;
// position: absolute;
// top: 0;
// left: 0;

// output 输出数据
// created 执行渲染

(function(self, output = undefined) {
	
	if(/mobile/i.test(navigator.userAgent)){
		self.created = new Function;
		return alert('暂时不支持移动端')
	}
	
	let selectLabel = null;
	let labelTarget = null;
	let typesSetting = 'row';
	let onmousemoveClose = true;
	let clientX, clientY, locationX, locationY, locationStartX, locationStartY;

	let childrensType //判断拖拽元素是否存在
		, newNum //纠正数组循环索引为正序
		, clientTop //循环对象位置的top
		, clientLeft //循环对象位置的left
		, elmtTop //将拖拽元素位置的top
		, elmLeft //将拖拽元素位置的left
		, oldIndexType //判断旧位置索引
		, listTypeLeft //判断位置的left
		, listTypeTop //判断位置的top
		, newIndexType //判断新位置索引
		, elmType //将拖拽元素不列入添加对象
		, newlist //listTypeLeft && listTypeTop && newIndexType && elmType 如果成立将将拖拽元素列入数组
		, newlistLeft //向前添加
		, newlistRight //向后添加
		, oldlist; //listTypeLeft && listTypeTop && newIndexType && elmType 如果不成立将将循环对象列入数组

	const deliver = (function DL(num, childrens, elm, childObject = {
		list: new Array, //生成后的数组
		oldIndex: 0, //旧的的索引
		newIndex: null //新的索引
	}) {
		if (num < 0) {
			childrensType = childrens.length != childObject.list.length;
			childObject = {
				list: childrensType ? childObject.list.concat([elm]) : childObject.list,
				oldIndex: childObject.oldIndex,
				newIndex: childrensType ? childrens.length : childObject.newIndex
			}
			return childObject;
		} else {
			newNum = childrens.length - 1 - num;

			clientTop = childrens[newNum].offsetTop;
			clientLeft = childrens[newNum].offsetLeft;

			elmLeft = locationX;
			elmtTop = locationY;

			// elmLeft = elmLeft < 0 && locationX > 0 ? -elmLeft : elmLeft;
			// elmtTop = elmtTop < 0 && locationY > 0 ? -elmtTop : elmtTop;

			listTypeLeft = (clientLeft <= elmLeft && elmLeft <= clientLeft + childrens[newNum].offsetWidth) || typesSetting ==
				'column';
			listTypeTop = clientTop <= elmtTop && elmtTop <= clientTop + childrens[newNum].offsetHeight;

			newIndexType = childObject.newIndex == null;
			oldIndexType = childObject.oldIndex == 0 && childrens[newNum].innerHTML == elm.innerHTML;
			elmType = childrens[newNum].innerHTML != elm.innerHTML;

			newlistLeft = childObject.list.concat([elm]).concat([childrens[newNum]]);
			newlistRight = childObject.list.concat([childrens[newNum]]).concat([elm]);
			newlist = locationStartX > locationX ? newlistLeft : newlistRight;
			oldlist = elmType ? childObject.list.concat([childrens[newNum]]) : childObject.list;
			childObject = {
				list: (listTypeLeft && listTypeTop && newIndexType && elmType) ? newlist : oldlist,
				oldIndex: oldIndexType ? newNum : childObject.oldIndex,
				newIndex: (listTypeLeft && listTypeTop && newIndexType && elmType) ? newNum : childObject.newIndex
			}
			// console.log('listTypeLeft',newNum,clientLeft,elmLeft,listTypeLeft && listTypeTop && newIndexType && elmType)
			// console.log('listTypeTop',newNum,clientTop,elmtTop,listTypeLeft && listTypeTop && newIndexType && elmType)
			// console.log("=================================================")
			return DL(num - 1, childrens, elm, childObject);
		}
	})

	const SorAnimation = (function(list, index, targetList) {
		let styleStr //css恢复效果
			, clientTop //循环对象位置的top
			, clientLeft //循环对象位置的left
			, clientList //存储的旧x,y
			, clientKey //存储的key
			, str = ''; //改变DOM
		for (let indexNum = 0; indexNum < list.length; indexNum++) {
			clientLeft = list[indexNum].offsetLeft;
			clientTop = list[indexNum].offsetTop;
			clientKey = list[indexNum].getAttribute('data-selectLabel-name');
			clientList = Object.assign({
				[clientKey]: {
					x: clientLeft,
					y: clientTop
				}
			}, clientList ? clientList : {});
			str += list[indexNum].outerHTML;
		}
		selectLabel.innerHTML = str;
		for (let indexNum = 0; indexNum < selectLabel.children.length; indexNum++) {
			clientKey = selectLabel.children[indexNum].getAttribute('data-selectLabel-name');
			clientLeft = clientList[clientKey].x - selectLabel.children[indexNum].offsetLeft + parseInt(selectLabel.children[
				indexNum].style.transform.split(',')[0].split('(')[1]);
			clientTop = clientList[clientKey].y - selectLabel.children[indexNum].offsetTop + parseInt(selectLabel.children[
				indexNum].style.transform.split(',')[1]);
			styleStr = `transform: translate(${clientLeft}px,${clientTop}px);`;
			// console.log(clientList[clientKey].x,selectLabel.children[indexNum].offsetLeft,'clientTop'+clientLeft,styleStr)
			// console.log(clientList[clientKey].y,selectLabel.children[indexNum].offsetTop,'clientTop'+clientTop,styleStr)
			// console.log("=================================================")
			selectLabel.children[indexNum].style = styleStr;
			indexNum == selectLabel.children.length - 1 && setTimeout(() => SorAnimationTransform(), 30);
		}

		targetList.list = selectLabel.children;
		typeof output != undefined && output.call(self, targetList);
	})
	const SorAnimationTransform = (function() {
		for (let indexNum = 0; indexNum < selectLabel.children.length; indexNum++) {
			setTimeout(() => {
				styleStr = `transform: translate(0,0);transition: .5s;`;
				selectLabel.children[indexNum].style = styleStr;
				indexNum == selectLabel.children.length - 1 && setTimeout(() => created(), 200);
			}, (indexNum * 30))
		}
	})

	const onmousedown = function(elm) {
		onmousemoveClose = false;
		clientX = elm.clientX - parseInt(elm.target.style.transform.split(',')[0].split('(')[1]);
		clientY = elm.clientY - parseInt(elm.target.style.transform.split(',')[1]);

		locationStartX = elm.clientX;
		locationStartY = elm.clientY;
		labelTarget = elm.target;
	}
	const onmousemove = function(elm) {
		if (onmousemoveClose) return;
		let offsetLeft = elm.clientX - clientX;
		let offsetTop = elm.clientY - clientY;

		locationX = elm.clientX;
		locationY = elm.clientY;
		labelTarget != null ? labelTarget.style = `transform: translate(${offsetLeft}px,${offsetTop}px);` : '';
	}
	const onmouseup = function(elm) {
		if (onmousemoveClose) return;
		onmousemoveClose = true;
		let targetList = deliver(selectLabel.children.length - 1, selectLabel.children, labelTarget);
		SorAnimation(targetList.list, targetList.newIndex, targetList);
		labelTarget = null;
	}

	const created = (function(id, fun = undefined, type = null) {
		output = fun;
		typesSetting = type != null ? type : typesSetting;
		selectLabel = selectLabel == null ? document.getElementById(id) : selectLabel;
		for (let index = selectLabel.children.length - 1; index >= 0; index--) {
			selectLabel.children[index].onmousedown = onmousedown;
			let offsetLeft = selectLabel.children[index].offsetLeft;
			let offsetTop = selectLabel.children[index].offsetTop;
			selectLabel.children[index].style = `transform: translate(0,0);`;
			selectLabel.children[index].setAttribute('data-selectLabel-name', 'selectLabel' + index);
		}
	})

	document.body.onmousemove = onmousemove;
	document.body.onmouseup = onmouseup;

	self.created = created;
}(window))
