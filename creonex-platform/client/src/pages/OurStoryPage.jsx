import ScrollReveal from '../components/ScrollReveal';
import '../styles/our-story.css';

const OurStoryPage = () => {
    return (
        <section className="our-story-section" id="our-story">
            <div className="container">
                <ScrollReveal animation="fade-up">
                    <div className="section-header">
                        <h2 className="section-title">Our Story</h2>
                    </div>
                </ScrollReveal>

                <div className="our-story-content">
                    <ScrollReveal animation="fade-up" delay={200}>
                        <p className="os-intro">
                            Creonex.viz was born from imagination, tradition, and a deep love for design.
                        </p>

                        <p className="os-paragraph">
                            Designing outfits was never just a hobby for me—it started at home. I grew up watching my mother, a skilled tailor, turn plain fabrics into meaningful garments. She didn’t just stitch clothes; she shaped creativity. Over the years, she trained more than 250+ students, and through her, I learned the foundation of design, patience, and precision.
                        </p>

                        <p className="os-paragraph">
                            Like many, my sister and I used to imagine outfits for ourselves—sketching ideas, visualising how fabrics could transform. But one problem always stayed the same:
                        </p>

                        <div className="os-highlight-box">
                            <p className="os-highlight-title">
                                Pinterest gives inspiration, not clarity.
                            </p>
                            <p>
                                People copy designs, yet still don’t know how the final outfit will actually look.
                            </p>
                        </div>

                        <h3 className="os-subheading">That’s where the idea clicked.</h3>

                        <p className="os-paragraph italic">
                            Why struggle with imagination gaps?<br />
                            Why guess the outcome after copying a reference?<br />
                            Why not bring the design to life before it’s stitched?
                        </p>

                        <p className="os-paragraph bold">
                            That question led to Creonex.viz.
                        </p>

                        <p className="os-paragraph">
                            At Creonex.viz, we turn your favourite fabrics and sarees into unique, wearable outfits—visually brought to life using AI. You don’t just see an idea; you see your design, your fabric, your vision—clearly and realistically.
                        </p>

                        <h3 className="os-subheading">And we didn’t stop at outfit design.</h3>

                        <p className="os-paragraph">
                            We also create realistic product visuals and professional shoot-style presentations, helping brands and creators showcase their products without expensive photoshoots. Clean, detailed, and true to the product—because visuals matter.
                        </p>

                        <div className="os-closing">
                            <div className="os-closing-text">
                                Creonex.viz is where tradition meets technology.<br />
                                Where imagination meets clarity.<br />
                                Where fabric turns into a future-ready visual story.
                            </div>
                            <div className="os-final-line">
                                No guesswork. No blind copying. Just design—made real.
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    );
};

export default OurStoryPage;
