const btns = document.querySelectorAll('.listen');
btns.forEach(btn => btn.addEventListener('click', () => createTextArea(btn, btn.parentNode.firstElementChild.lastElementChild.firstElementChild.innerHTML)))

const createTextArea = (div, context) => {
    const id = div.getAttribute('id');
    const newItem = document.createElement('div');
    newItem.innerHTML = `
        <form method="POST" action="/posts/editcomment/${id}">
			<div class="form-group">
				<textarea id="txtarea" class="form-control" name="textAreaContent">${context}</textarea>
			</div>
			<button id="saveBtn" class="btn btn-outline-success" type="submit">Save</button>
	    </form>
    `;
    div.parentNode.firstElementChild.lastElementChild.replaceChild(newItem, div.parentNode.firstElementChild.lastElementChild.firstElementChild);
    div.disabled = true;
}







