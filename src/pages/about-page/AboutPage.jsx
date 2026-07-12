import './AboutPage.css';
import { useLanguage } from '../../context/LanguageContext';

const AboutPage = () => {
  const { t } = useLanguage();

  return (
    <main className="about-page">
      <article className="about-project-card">
        <p className="about-project-eyebrow">{t('about.eyebrow')}</p>
        <h1>{t('about.title')}</h1>
        <p className="about-project-intro">{t('about.intro')}</p>

        <div className="about-project-sections">
          <section>
            <h2>{t('about.educationTitle')}</h2>
            <p>{t('about.educationBody')}</p>
          </section>
          <section>
            <h2>{t('about.objectiveTitle')}</h2>
            <p>{t('about.objectiveBody')}</p>
          </section>
        </div>

        <p className="about-project-note">{t('about.disclaimer')}</p>
      </article>
    </main>
  );
};

export default AboutPage;
