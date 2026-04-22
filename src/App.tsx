import {CinematicStage} from './components/CinematicStage';

export default function App() {
  return (
    <main className="page-shell" id="top">
      <section className="hero">
        <div className="hero-copy">
          <p className="hero-kicker">Scroll-directed motion study</p>
          <h1>Tailored ritual, unfolding frame by frame.</h1>
          <p className="hero-body">
            A cinematic landing page that reveals four categories as the gesture moves from reach to spark,
            ignition, and quiet ease.
          </p>
        </div>
        <div className="scroll-cue" aria-hidden="true">
          <span />
          <p>Scroll to discover</p>
        </div>
      </section>
      <CinematicStage />
      <section className="outro">
        <p className="outro-kicker">Last frame</p>
        <h2>Neutral light. Clean air. One final silhouette holding the tone.</h2>
        <a href="#top">Return to opening</a>
      </section>
    </main>
  );
}
