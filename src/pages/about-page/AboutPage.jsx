import './AboutPage.css';

const AboutPage = () => (
  <main className="about-page">
    <article className="about-project-card">
      <p className="about-project-eyebrow">À propos</p>
      <h1>Le projet GEE</h1>
      <p className="about-project-intro">
        Geneva Events Explorer est né dans le cadre d’un projet scolaire avec
        l’objectif de rendre les événements genevois plus simples à découvrir.
      </p>

      <div className="about-project-sections">
        <section>
          <h2>Une démarche pédagogique</h2>
          <p>
            Le site a été imaginé et développé comme un exercice complet de
            conception web : collecte de données, création d’une API, interface
            responsive et mise en ligne d’une application accessible au public.
          </p>
        </section>
        <section>
          <h2>Notre objectif</h2>
          <p>
            GEE rassemble les informations publiques de l’agenda de la Ville de
            Genève et les présente par catégorie dans une interface claire,
            visuelle et adaptée aux différents écrans.
          </p>
        </section>
      </div>

      <p className="about-project-note">
        GEE est un projet éducatif indépendant. Il n’est ni exploité ni affilié
        à la Ville de Genève. Les informations relatives aux événements restent
        la propriété de leurs sources respectives.
      </p>
    </article>
  </main>
);

export default AboutPage;
