<script lang="ts">
	import { page } from '$app/stores';
	import Toasts from '$lib/components/toasts.svelte';
	import { toasts } from '$lib/stores';
	import { onMount } from 'svelte';
	import './global.css';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Loader from '$lib/components/loader.svelte';
	import { beforeNavigate, afterNavigate } from '$app/navigation';

	export let data;

	// Automatically display a toast if a form action returns a string
	$: if (typeof $page.form === 'string') {
		toasts.notify($page.form);
	}

	let menu: HTMLMenuElement;
	let hamburgerCheckbox: HTMLInputElement;
	let isLoading = false;
	beforeNavigate(() => (isLoading = true));
	afterNavigate(() => (isLoading = false));

	onMount(() => {
		for (const link of menu.childNodes) {
			link.addEventListener('click', () => {
				// Close the menu when a link is clicked on mobile
				hamburgerCheckbox.checked = false;
			});
		}
	});
</script>

<nav>
	<label for="hamburgerCheckbox" id="hamburger"
		><img
			src="/burger_Menu.png"
			alt="ACC ACM logo"
			id="hamburger-logo"
			style="width:50px; height:20px"
		/><b>MENU</b></label
	>
	<input
		type="checkbox"
		id="hamburgerCheckbox"
		bind:this={hamburgerCheckbox}
		style="display: none"
	/>
	<menu id="menu" bind:this={menu}>
		<img src="/transparent-icon.png" id="menu-logo" alt="RiverHacks 24 Logo" />
		<li>
			<a href="/" class:active={$page.url.pathname === '/' && $page.url.hash === ''}>Home</a>
		</li>
		{#if !data.user?.roles.includes('ADMIN')}
			<li>
				<a href="/#Announcements" class:active={$page.url.hash === '#Announcements'}
					>Announcements</a
				>
			</li>
			<li>
				<a href="/#Schedule" class:active={$page.url.hash === '#Schedule'}>Schedule</a>
			</li>
			<li>
				<a href="/#FAQ" class:active={$page.url.hash === '#FAQ'}>FAQ</a>
			</li>
			<li>
				<a href="/#Challenges" class:active={$page.url.hash === '#Challenges'}>Challenges</a>
			</li>
			<li>
				<a href="/#Sponsors" class:active={$page.url.hash === '#Sponsors'}>Sponsors</a>
			</li>
		{/if}
		<!-- NOTE: if we ever add a mentor/judge/volunteer application this needs to be changed -->
		{#if data.user !== undefined && (!data.user.roles.includes('HACKER') || data.user.roles.length > 1 || data.user.status === 'CONFIRMED')}
			<li><a href="/id" class:active={$page.url.pathname.startsWith('/id')}>My Hacker ID</a></li>
		{/if}
		{#if data.user?.roles.includes('ORGANIZER') || data.user?.roles.includes('ADMIN')}
			<li><a href="/scan" class:active={$page.url.pathname.startsWith('/scan')}>Scan</a></li>
		{/if}
		{#if data.user?.roles.includes('HACKER')}
			<li><a href="/apply" class:active={$page.url.pathname.startsWith('/apply')}>Apply</a></li>
		{/if}
		{#if data.user?.roles.includes('ADMIN') || data.user?.roles.includes('SPONSOR')}
			<li>
				<!-- HACK: Tell SvelteKit to force refresh on /users since
				IDK how to reset the filters on the users page otherwise -->
				<a
					href="/users"
					class:active={$page.url.pathname.startsWith('/users')}
					data-sveltekit-reload>Users</a
				>
			</li>
			{#if data.user?.roles.includes('ADMIN')}
				<li><a href="/admin" class:active={$page.url.pathname.startsWith('/admin')}>Admin</a></li>
				<li>
					<a href="/admissions" class:active={$page.url.pathname.startsWith('/admissions')}
						>Admissions</a
					>
				</li>
			{/if}
		{/if}
		<li>
			{#if data.user === undefined}
				<a class="login" href="/login" class:active={$page.url.pathname.startsWith('/login')}
					>Login</a
				>
			{:else}
				<form method="POST" action="/logout">
					<button class="button" type="submit">Logout</button>
				</form>
			{/if}
		</li>
	</menu>

	{#if isLoading}
		<div class="overlay">
			<Loader />
		</div>
	{/if}
</nav>

{#if $page.url.pathname === '/'}
	<a
		class="banner"
		id="mlh-trust-badge"
		href="https://mlh.io/na?utm_source=na-hackathon&utm_medium=TrustBadge&utm_campaign=2024-season&utm_content=red"
		target="_blank"
		rel="noreferrer"
		><img
			src="https://s3.amazonaws.com/logged-assets/trust-badge/2024/mlh-trust-badge-2024-red.svg"
			alt="Major League Hacking 2024 Hackathon Season"
			id="mlh-badge-image"
		/></a
	>
{/if}

{#key $page.url.pathname}
	<div in:fade={{ easing: cubicOut, duration: 300 }}>
		<slot />
	</div>
{/key}

<Toasts />

<footer>
	<div class="footer-flex">
		<div class="flex made-with-love">
			<p>© 2024 Austin Community College Association for Computing Machinery Student Chapter</p>
			<p>
				This site is powered by<a href="https://freetailhackers.com">Rodeo,</a> an end to end,
				hackathon management platform.

				<br />
				Made-with ❤️ by
				<a
					class="accacmlink"
					target="_blank"
					rel="noopener noreferrer"
					href="https://freetailhackers.com">Freetail Hackers</a
				>
			</p>
		</div>
		<div class="flex-column">
			<div class="row category">Links</div>
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://www.instagram.com/acc.csc?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
				>Instagram</a
			>
			<!-- <a
				target="_blank"
				rel="noopener noreferrer"
				href="https://www.linkedin.com/company/freetail-hackers">LinkedIn</a
			> -->
			<!-- <a target="_blank" rel="noopener noreferrer" href="https://freetailhackers.com/discord"
				>Discord</a -->
			<!-- >
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://docs.google.com/forms/d/e/1FAIpQLSdQld-vgVLXOuIXIcUNpTFMwii_7Cu9Vqj7CVxXs3ScFsCIrg/viewform?usp=sf_link"
				>Feedback</a
			> -->
			<a href="mailto:contact@austincs.org">Contact Us</a>
		</div>
		<div class="flex-column">
			<div class="row category">Other Hackathons</div>
			<a target="_blank" rel="noopener noreferrer" href="https://rowdyhacks.org/"> RowdyHacks</a>
			<a target="_blank" rel="noopener noreferrer" href="https://tamuhack.org/"> TAMUhack</a>
			<a target="_blank" rel="noopener noreferrer" href="https://hackutd.co/"> HackUTD</a>
			<a target="_blank" rel="noopener noreferrer" href="https://www.unthackathon.com/">HackUNT</a>
			<a target="_blank" rel="noopener noreferrer" href="https://hackuta.org"> HackUTA</a>
		</div>
	</div>
</footer>

<style>
	#mlh-trust-badge {
		z-index: 2;
		position: absolute;
		display: block;
		right: 15px;
		top: 56px;
		width: calc(4vw + 3rem);
	}

	#mlh-badge-image {
		width: 100%;
	}

	footer {
		background-color: var(--background-color);
	}

	.footer-flex {
		display: flex;
		justify-content: space-around;
		margin: auto;
		max-width: 75em;
		color: var(--highlight-color);
	}

	.login {
		color: #e1563f;
	}

	.made-with-love {
		align-self: left;
	}

	.accacmlink {
		color: #e1563f;
		text-decoration: underline;
	}

	.flex-column {
		display: flex;
		flex-direction: column;
		font-size: 14px;
	}

	a {
		color: #f2ebd9;
		text-decoration: none;
		line-height: 1.5;
	}

	button {
		color: var(--highlight-color);
		text-decoration: none;
		line-height: 1.5;
		padding-left: 1rem;
		padding-right: 1rem;
	}

	a:hover,
	button:hover {
		text-decoration-line: underline;
		text-decoration-style: solid;
		text-decoration-color: var(--secondary-color);
		/* background-color: var(--secondary-color); */
		color: var(--primary-accent);
	}

	.category {
		font-size: 17px;
	}

	label {
		display: flex;
		font-family: 'Geologica', sans-serif;
		font-weight: 700;
		font-style: normal;
		text-transform: uppercase;
		color: #f2ebd9;
	}

	#hamburger-logo {
		display: block;
		height: 2rem;
		padding-right: 1rem;
		padding-left: 1rem;
	}

	#menu-logo {
		display: none;
	}

	button {
		text-transform: uppercase;
		font-family: 'Geologica', sans-serif;
		font-weight: 700;
		border-radius: 5px;
	}

	nav {
		position: sticky;
		top: 0;
		margin: 0;
		width: 100vw;
		background-color: var(--background-color);
		z-index: 99;
	}

	menu {
		list-style: none;
		margin: 0;
		padding: 0;
		transition: all 0.5s ease-out;
		background-color: var(--background-color);
		max-height: 0;
		overflow: hidden;
		width: 100%;
		font-family: 'Geologica', sans-serif;
		font-size: 15px;
		font-weight: 700;
		font-style: normal;
		text-transform: uppercase;
	}

	#hamburger {
		display: flex;
		width: 100%;
		padding-top: 0.7rem;
		padding-bottom: 0.7rem;
		justify-content: flex-start;
		align-items: center;
		flex-wrap: nowrap;
		flex-direction: row;
	}

	#hamburgerCheckbox:checked + menu {
		display: flex;
		flex-direction: column;
		max-height: 100vh;
	}

	menu a {
		display: block;
		width: 100%;
		padding: 0.7rem 1rem;
		color: #f2ebd9;
		text-decoration: none;
	}

	menu a:hover,
	button:hover {
		background-color: var(--secondary-color);
		color: var(--background-color);
	}

	.active {
		font-weight: bold;
		text-decoration: underline;
	}

	@media (max-width: 768px) {
		.flex-column {
			display: none;
		}

		.footer-flex {
			max-width: 60vw;
		}
	}

	@media (max-width: 1090px) {
		.button {
			display: flex;
			width: 100%;
			padding-top: 0.3rem;
			padding-bottom: 0.7rem;
			padding-left: 1rem;
			justify-content: flex-start;
			flex-wrap: nowrap;
			flex-direction: row;
		}

		#mlh-trust-badge {
			top: 42.2px;
		}
	}

	@media (min-width: 1090px) {
		/* minimum width that can fit all navbar tabs for admin accounts (which have the most number of tabs currently) */
		/* should be updated if we change the number of tabs */
		#hamburger-logo {
			display: none;
		}

		#menu-logo {
			display: block;
			height: 40px;
		}

		#hamburger {
			display: none;
		}

		menu {
			margin: 0;
			padding-top: 0.5rem;
			padding-bottom: 0.5rem;
			display: flex;
			justify-content: space-around;
			max-height: fit-content;
			align-items: center;
		}

		menu a:hover,
		button:hover {
			border-radius: 5px;
		}

		menu a {
			display: inline;
			width: initial;
			text-decoration: none;
		}
	}

	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 9999; /* Set a high z-index to ensure the overlay appears on top */
		background-color: rgba(183, 65, 65, 0.05); /* Semi-transparent background color */
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
