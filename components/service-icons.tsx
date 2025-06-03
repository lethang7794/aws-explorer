import type { Service } from '@/lib/aws-services-data'

export function ServiceIcons({
  service,
  size = 'small',
}: {
  service: Service
  size?: 'small' | 'large'
}) {
  const className = size === 'large' ? 'h-16 w-16 lg:h-24 lg:w-24' : 'h-12 w-12'

  return (
    <>
      {service.iconService ? (
        <img
          src={`/aws/${service.iconService}.svg`}
          alt={service.iconService}
          className={className}
        />
      ) : service.iconServices ? null : (
        <img
          src={`/aws/GeneralResource.svg`}
          alt={service.iconService}
          className={className}
        />
      )}
      {service.iconServices ? (
        <div className="flex flex-wrap justify-center gap-2">
          {service.iconServices.map((icon) => (
            <img
              key={icon}
              src={`/aws/${icon}.svg`}
              alt={icon}
              className={className}
            />
          ))}
        </div>
      ) : null}
    </>
  )
}
