// components/site-footer.js
class SiteFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const currentYear = new Date().getFullYear();

    this.shadowRoot.innerHTML = `
			<style>
				footer {
					background: var(--darker);
					background: linear-gradient(135deg, var(--section-bg), var(--section-bg-alt));
					background: var(--section-bg-alt);
					padding: 1.5rem 0;
					border-top: 1px solid var(--glass-border);
				}

				.footer-content {
					text-align: center;
				}

				.copyright {
					color: var(--gray);
					font-size: 0.875rem;
				}
			</style>
			
			<footer>
				<div class="container">
					<div class="footer-content">
						<p class="copyright">&copy; ${currentYear} OpenMined. All rights reserved.</p>
					</div>
				</div>
			</footer>
		`;
  }
}

customElements.define("site-footer", SiteFooter);
