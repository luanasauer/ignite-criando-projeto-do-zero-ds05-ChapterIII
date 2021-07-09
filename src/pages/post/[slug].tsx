import { useRouter } from 'next/router'
import { getPrismicClient } from '../../services/prismic';
import { RichText } from "prismic-dom";
import Prismic from '@prismicio/client'
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { FiUser, FiCalendar, FiClock } from "react-icons/fi";
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';


interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {

  const dateFirstFormated = format(
    new Date(post.first_publication_date),
    "dd MMM yyyy", {
    locale: ptBR,
  })

  const router = useRouter()
  if (router.isFallback) {
    return <div>Carregando...</div>
  }


  const totalWords = post.data.content.reduce((total, contentItem) => {
    total += contentItem.heading?.split(' ').length;

    if (isNaN(total)) {
      total = 0;
    }
    const words = contentItem.body.map(item => item.text.split(' ').length);
    words.map(word => (total += word));

    return total;
  }, 0);

  const estimatedReadingTime = Math.ceil(totalWords / 200);



  return (
    <>
      <img src={post.data.banner.url} alt="" className={styles.banner} />
      <main className={styles.container}>
        <article className={styles.post}>

          <h1>{post.data.title}</h1>
          <span>
            <time>
              <FiCalendar />
              {dateFirstFormated}
            </time>
            <span>
              <FiUser /> {post.data.author}
            </span>
            <span>
              <FiClock />
              {`${estimatedReadingTime} min`}
            </span>
          </span>

          {post.data.content.map(content => {
            return (
              <article key={content.heading} className={styles.post}>
                <h1>{content.heading}</h1>
                <div
                  className={styles.postContent}
                  dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }}
                >
                </div>
              </article>
            )
          })}
        </article>
      </main>

    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});
  const post = {
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: ([...content.body])
        }
      })
    },
    first_publication_date: response.first_publication_date
  };

  return {
    props: {
      post,
    },
    redirect: 60 * 60,
  }
};
