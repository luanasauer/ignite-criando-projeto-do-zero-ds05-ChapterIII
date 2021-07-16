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
import Comments from '../../components/Comments';
import React from 'react';
import Link from 'next/link';


interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
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
  preview: boolean;
  navigation: {
    prevPost: {
      uid: string,
      data: {
        title: string
      }
    }[]
    nextPost: {
      uid: string,
      data: {
        title: string
      }
    }[]
  }
}

export default function Post({ post, preview, navigation }: PostProps) {

  const dateFirstFormated = format(
    new Date(post.first_publication_date),
    "dd MMM yyyy", {
    locale: ptBR,
  })



  const isPostEdited = post.last_publication_date != post.first_publication_date;

  let dateLastFormated;

  if (isPostEdited) {
    dateLastFormated = format(
      new Date(post.last_publication_date),
      "'* editado em' dd MMM yyyy', as' H':'m", {
      locale: ptBR,
    });
  }

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
          {isPostEdited && <div className={styles.postEdited}>{dateLastFormated}</div>}

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

          <section className={`${styles.navigation} ${commonStyles.container}`} >

            {navigation?.prevPost.length > 0 && (
              <div>
                <h3>{navigation.prevPost[0].data.title}</h3>
                <Link href={`/post/${navigation.prevPost[0].uid}`}>
                  <a> Post anterior</a>
                </Link>
              </div>
            )}
            {navigation?.nextPost.length > 0 && (
              <div>
                <h3>{navigation.nextPost[0].data.title}</h3>
                <Link href={`/post/${navigation.nextPost[0].uid}`}>
                  <a> Próximo post</a>
                </Link>
              </div>)}

          </section>

          {preview && (
            <aside>
              <Link href="/api/exit-preview">
                <a className={commonStyles.preview}>Sair do modo Preview</a>
              </Link>
            </aside>
          )}

          <Comments >
          </Comments>
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

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const prevPost = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]'
    }
  )

  const nextPost = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.last_publication_date desc]'
    }
  )


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
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date
  };

  return {
    props: {
      post,
      preview,
      navigation: {
        prevPost: prevPost?.results,
        nextPost: nextPost?.results
      }
    },
    redirect: 60 * 60,
  }
};
