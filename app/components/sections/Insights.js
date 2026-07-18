import Image from 'next/image';
import styles from './Insights.module.css';

const posts = [
  { num: 1, label: 'BLOG 1', title: 'What is Spatial Design?', desc: 'Understanding the thinking behind spaces that truly work.', img: '/images/hero_living_room.png', tag: 'SPATIAL THINKING' },
  { num: 2, label: 'BLOG 2', title: 'Spatial vs Interior Design', desc: 'Key differences every homeowner should know before they begin.', img: '/images/kitchen_modern.png', tag: 'DESIGN CLARITY' },
  { num: 3, label: 'BLOG 3', title: 'Mistakes in Home Planning', desc: 'Common planning mistakes that cost time, money, and comfort.', img: '/images/blueprint_desk.png', tag: 'PLANNING GUIDE' },
];

export default function Insights() {
  return (
    <section id="insights" className={styles.section}>
      {/* side visuals removed per request */}
      <div className={styles.content}>
        {/* header labels removed per request */}
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>Ideas That <span>Shape Better Spaces.</span></h2>
        </div>
        <p className={styles.subtitle}>PERSPECTIVES ON DESIGN, PLANNING, AND SPACES THAT WORK.</p>
        <div className={styles.grid}>
          {posts.map((post) => (
            <div className={styles.card} key={post.num}>
              <div className={styles.imgWrap}>
                <Image src={post.img} alt={post.title} fill style={{objectFit:'cover'}} />
              </div>
              <div className={styles.cardContent}>
                <div className={styles.label}>{post.label}</div>
                <h3 className={styles.cardTitle}>{post.title}</h3>
                <p className={styles.cardDesc}>{post.desc}</p>
                <a href="#" className={styles.readMore}>READ MORE &rarr;</a>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* footer divider removed per request */}
    </section>
  );
}
