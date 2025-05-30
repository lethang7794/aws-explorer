import AwsServicesList from "./aws-services-list"

const awsServicesData = [
  {
    service: "Amazon A2I",
    shortDescription: "Easily implement human review of ML predictions",
    url: "https://docs.aws.amazon.com/augmented-ai",
    categories: ["Machine Learning"],
    detailDescription:
      "Amazon Augmented AI (Amazon A2I) enables you to build the workflows required for human review of ML predictions. Amazon A2I brings human review to all developers, removing the undifferentiated heavy lifting associated with building human review systems or managing large numbers of human reviewers.",
  },
  {
    service: "Amazon API Gateway",
    shortDescription: "Build, deploy, and manage APIs",
    url: "https://docs.aws.amazon.com/apigateway",
    categories: ["Networking & Content Delivery", "Serverless"],
    detailDescription:
      "Amazon API Gateway enables you to create and deploy your own REST and WebSocket APIs at any scale. You can create robust, secure, and scalable APIs that access Amazon Web Services or other web services, as well as data that’s stored in the AWS Cloud. You can create APIs to use in your own client applications, or you can make your APIs available to third-party app developers.",
  },
  {
    service: "Amazon AppFlow",
    shortDescription: "No-code integration for SaaS apps and AWS services",
    url: "https://docs.aws.amazon.com/appflow",
    categories: ["Analytics"],
    detailDescription:
      "Amazon AppFlow is a fully managed API integration service that you use to connect your software as a service (SaaS) applications to AWS services, and securely transfer data. Use Amazon AppFlow flows to manage and automate your data transfers without needing to write code.",
  },
  {
    service: "AWS Amplify",
    shortDescription: "Build scalable mobile and web apps fast",
    url: "https://docs.aws.amazon.com/amplify",
    categories: ["Mobile", "Developer Tools", "Serverless"],
    detailDescription:
      "AWS Amplify is a set of tools and services that can be used together or on their own, to help front-end web and mobile developers build scalable full stack applications, powered by AWS. With Amplify, you can configure app backends and connect your app in minutes, deploy static web apps in a few clicks, and easily manage app content outside the AWS console.",
  },
  {
    service: "Amazon S3",
    shortDescription: "Scalable storage in the cloud",
    url: "https://docs.aws.amazon.com/s3",
    categories: ["Storage"],
    detailDescription:
      "Amazon Simple Storage Service (Amazon S3) is an object storage service that offers industry-leading scalability, data availability, security, and performance. This means customers of all sizes and industries can use it to store and protect any amount of data for a range of use cases, such as websites, mobile applications, backup and restore, archive, enterprise applications, IoT devices, and big data analytics.",
  },
  {
    service: "Amazon EC2",
    shortDescription: "Virtual servers in the cloud",
    url: "https://docs.aws.amazon.com/ec2",
    categories: ["Compute"],
    detailDescription:
      "Amazon Elastic Compute Cloud (Amazon EC2) is a web service that provides secure, resizable compute capacity in the cloud. It is designed to make web-scale cloud computing easier for developers. Amazon EC2’s simple web service interface allows you to obtain and configure capacity with minimal friction.",
  },
  {
    service: "AWS Lambda",
    shortDescription: "Run code without thinking about servers",
    url: "https://docs.aws.amazon.com/lambda",
    categories: ["Compute", "Serverless"],
    detailDescription:
      "AWS Lambda lets you run code without provisioning or managing servers. You pay only for the compute time you consume - there is no charge when your code is not running. With Lambda, you can run code for virtually any type of application or backend service - all with zero administration.",
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <AwsServicesList services={awsServicesData} />
    </main>
  )
}
