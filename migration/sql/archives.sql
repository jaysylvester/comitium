create index on "arcthreads" ( "ithreadid" );
create index on "arcthreads" ( "chthreadlock" );
create index on "arcmessages" ( "imessageid" );
create index on "arcmessages" ( "ithreadid" );
create index on "arcmessages" ( "dtmessagedate" );

insert into "topics" ( "id", "discussionID", "title", "titleHtml", "url", "created", "replies", "draft", "private", "lockedByID" )
  select distinct "ithreadid" as "id", coalesce( ( select distinct 22 from "arcthreads" where "ithreadid" = at."ithreadid" and "icategoryid" = 2 ), "icategoryid" ) as "discussionID", '' as "title", "vchthreadname" as "titleHtml", ' ' as "url", "dtinsertdate" as "created", ( select count("imessageid") - 1 from "arcmessages" where "ithreadid" = at."ithreadid" ) as "replies", false as "draft", false as "private", coalesce( ( select 4308 from "arcthreads" where "ithreadid" = at."ithreadid" and "chthreadlock" like 'Locked%' ), null ) as "lockedByID"
  from "arcthreads" at
  order by "created" asc;

insert into "posts" ( "id", "topicID", "userID", "text", "html", "created", "draft" )
  select distinct "imessageid" as "id", "ithreadid" as "topicID", coalesce( ( select distinct 4308 from "arcmessages" where "imessageid" = am."imessageid" and "iuserid" = 1 ), "iuserid" ) as "userID", '' as "text", "txmessage" as "html", "dtmessagedate" as "created", false as "draft"
  from "arcmessages" am
  order by "created" asc;

SELECT SETVAL('topics_id_seq', ( select max("id") + 1 from topics ) );

-- Move old announcements to the Announcements forum
insert into announcements ( "discussionID", "topicID" )
  select 2 as "discussionID", id
  from topics t
  where t."discussionID" = 7;

update topics set "discussionID" = 2 where "discussionID" = 7;

delete from discussions where id = 7;
delete from "discussionPermissions" where "discussionID" = 7;

-- Update discussion and topic stats
update "topics" t set "replies" = ( select count("id") - 1 from "posts" where "topicID" = t."id" and "draft" = false ) where "id" = t."id";

update "discussions" d set "topics" = ( select count("id") from "topics" t where t."discussionID" = d."id" and "draft" = false ), "posts" = ( select count(p."id") from "posts" p join "topics" t on p."topicID" = t."id" where t."discussionID" = d."id" and p."draft" = false ) where "id" = d."id";
