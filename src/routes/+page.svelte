<script lang="ts">
	import Announcements from '$lib/components/announcements.svelte';
	import FAQ from '$lib/components/faq.svelte';
	import Schedule from '$lib/components/schedule.svelte';
	import Sponsors from '$lib/components/sponsors.svelte';
	import Challenges from '$lib/components/challenges.svelte';
	import SvelteMarkdown from 'svelte-markdown';
	import { toasts } from '$lib/stores';
	export let data;
	import { onMount } from 'svelte';

	// Some helpful error messages triggered in /src/lib/authenticate.ts
	onMount(() => {
		if (location.search === '?unauthenticated') {
			toasts.notify('You must be logged in to do perform that action.');
		} else if (location.search === '?forbidden') {
			toasts.notify('You do not have permissions to do that.');
		}
	});
</script>

<svelte:head>
	<title>RiverHacks | Home</title>
</svelte:head>

<div class="topographic-background">
	<div>
		<!-- svelte-ignore a11y-img-redundant-alt -->
		<img src="/riverhacks-wideflyer.png" alt="png" class="home-svg" />
		<div class="homepage-text">
			<SvelteMarkdown source={data.settings.homepageText} />
		</div>
	</div>
</div>
<div>
	{#if data.user !== undefined}
		<!-- Admin announcements panel -->
		<section id="Announcements">
			<Announcements announcements={data.announcements} admin={data.user.roles.includes('ADMIN')} />
		</section>
	{:else}
		<section id="Announcements">
			<Announcements announcements={data.announcements} admin={false} />
		</section>
	{/if}
</div>

<section id="Schedule">
	<Schedule user={data.user} schedule={data.schedule} settings_timezone={data.settings.timezone} />
</section>

<section id="FAQ">
	<FAQ user={data.user} questions={data.faqs} />
</section>

<section id="Challenges">
	<Challenges user={data.user} challenges={data.challenges} />
</section>

<section id="Sponsors">
	<Sponsors
		sponsors={[
			// ['Roblox', 'https://create.roblox.com/landing'],
			// ['Capital One', 'http://api.nessieisreal.com/'],
			// ['CodeCrafters', 'https://codecrafters.io/event/freetailhackers'],
			['Red Bull', '#'],
			// ['Stand Out Stickers', 'http://hackp.ac/mlh-StandOutStickers-hackathons'],
		]}
	/>
</section>

<style>
	section {
		scroll-margin-top: 5vh;
	}

	.home-svg {
		width: 100vw;
		user-select: none;
		pointer-events: none;
	}

	.homepage-text {
		position: absolute;
		top: 73%;
		left: 15%;
		color: #f2ebd9;
		font-size: clamp(0.75rem, 2vw, 2rem);
		max-width: 50%;
		margin-right: 4rem;
	}

	.topographic-background {
		position: relative;
	}
</style>
