window.addEventListener('hashchange', () => {
	const hash = window.location.hash;

	if (hash === "#login" || hash === "#register")
		document.querySelector('#buttons').style.display = 'none';
	else
		document.querySelector('#buttons').style.display = 'block';

	const formContainer = document.querySelector('#formContainer');

	if (hash === "#login" || hash === "#register") {
		const form = document.createElement('form');
		const emailInput = document.createElement('input');
		const passInput = document.createElement('input');
		const submitBttn = document.createElement('button');

		emailInput.setAttribute('type', 'email');
		emailInput.setAttribute('autocomplete', 'on');
		emailInput.setAttribute('placeholder', 'Email');
		emailInput.setAttribute('name', 'email');
		passInput.setAttribute('type', 'password');
		passInput.setAttribute('placeholder', 'Password');
		passInput.setAttribute('name', 'password');
		passInput.setAttribute('autocomplete', 'on');
		submitBttn.setAttribute('type', 'submit');
		submitBttn.textContent = 'Submit';
		
		if (hash === "#login") {
			document.querySelector('#titulo').innerHTML = 'LOGIN';
			document.querySelector('#descricao').innerHTML =
				'Não tem uma conta? <a href="#register">Registre-se</a>';
			form.setAttribute('id', 'login_form');
			form.setAttribute('method', 'GET');
		}
		else if (hash === "#register") {
			document.querySelector('#titulo').innerHTML = 'REGISTER';
			document.querySelector('#descricao').innerHTML =
				'Já tem uma conta? <a href="#login">Entre</a>';
			form.setAttribute('id', 'register_form');
			form.setAttribute('method', 'POST');
		}

		form.appendChild(emailInput);
		form.appendChild(document.createElement('br'));
		form.appendChild(passInput);
		form.appendChild(document.createElement('br'));
		form.appendChild(submitBttn);
		formContainer.innerHTML = '';
		formContainer.appendChild(form);
	} else if (hash === "#play") {
		document.querySelector('#titulo').innerHTML = 'PLAY';
		document.querySelector('#descricao').innerHTML =
			'Jogue transcendence';
		formContainer.innerHTML = '';
	} else {
		document.querySelector('#titulo').innerHTML = 'HOME';
		document.querySelector('#descricao').innerHTML =
			'Bem vindo ao transcendence';
		formContainer.innerHTML = '';
	}
});
